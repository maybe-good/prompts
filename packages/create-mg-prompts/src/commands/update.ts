import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copy, readFile } from 'fs-extra';
import { findProjectRoot } from '../utils/project.js';
import { getDefaultPromptsPath, getManifestPath } from '../utils/paths.js';
import { loadAvailablePrompts, getPromptContent } from '../utils/prompts.js';
import { loadManifest, saveManifest, checkFileModified } from '../utils/manifest.js';
import type { InstalledPrompt } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface UpdateOptions {
  force?: boolean;
}

export async function update(options: UpdateOptions) {
  const spinner = ora();
  
  try {
    const projectRoot = await findProjectRoot();
    const manifestPath = getManifestPath(projectRoot);
    const manifest = await loadManifest(manifestPath);
    
    if (!manifest || manifest.prompts.length === 0) {
      console.log(chalk.yellow('No prompts installed in this project.'));
      console.log(chalk.gray('Run `create-mg-prompts init` to install prompts.'));
      return;
    }
    
    spinner.start('Checking for updates...');
    const availablePrompts = await loadAvailablePrompts();
    const availablePromptsMap = new Map(availablePrompts.map(p => [p.id, p]));
    
    const updates: Array<{
      prompt: InstalledPrompt;
      newVersion: string;
      modified: boolean;
    }> = [];
    
    // Check each installed prompt
    for (const installedPrompt of manifest.prompts) {
      const availablePrompt = availablePromptsMap.get(installedPrompt.id);
      
      if (!availablePrompt) {
        continue; // Prompt no longer available
      }
      
      if (availablePrompt.metadata.version !== installedPrompt.version) {
        // Check if local file was modified
        const promptPath = join(projectRoot, getDefaultPromptsPath(), availablePrompt.path);
        const originalContent = await getPromptContent(availablePrompt.path);
        const isModified = await checkFileModified(promptPath, originalContent);
        
        updates.push({
          prompt: installedPrompt,
          newVersion: availablePrompt.metadata.version,
          modified: isModified
        });
      }
    }
    
    spinner.succeed('Update check complete');
    
    if (updates.length === 0) {
      console.log(chalk.green('✅ All prompts are up to date!'));
      return;
    }
    
    // Show available updates
    console.log(chalk.blue(`\n📦 ${updates.length} update(s) available:\n`));
    
    updates.forEach(({ prompt, newVersion, modified }) => {
      const modifiedWarning = modified ? chalk.yellow(' ⚠️  (local changes detected)') : '';
      console.log(`  ${chalk.green('●')} ${prompt.id}: v${prompt.version} → v${newVersion}${modifiedWarning}`);
    });
    
    // Check for modified files
    const modifiedUpdates = updates.filter(u => u.modified);
    
    if (modifiedUpdates.length > 0 && !options.force) {
      console.log(chalk.yellow('\n⚠️  Warning: Some prompts have local modifications.'));
      console.log(chalk.gray('Use --force to overwrite local changes.'));
      
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Continue with update (modified files will be skipped)?',
          default: true
        }
      ]);
      
      if (!proceed) {
        console.log(chalk.red('Update cancelled.'));
        return;
      }
    }
    
    // Perform updates
    spinner.start('Updating prompts...');
    let updatedCount = 0;
    
    for (const { prompt, newVersion, modified } of updates) {
      if (modified && !options.force) {
        continue; // Skip modified files unless forced
      }
      
      const availablePrompt = availablePromptsMap.get(prompt.id)!;
      const sourcePath = join(__dirname, 'prompts', availablePrompt.path);
      const targetPath = join(projectRoot, getDefaultPromptsPath(), availablePrompt.path);
      
      await copy(sourcePath, targetPath, { overwrite: true });
      
      // Update manifest entry
      const manifestPrompt = manifest.prompts.find(p => p.id === prompt.id)!;
      manifestPrompt.version = newVersion;
      manifestPrompt.modified = false;
      
      updatedCount++;
    }
    
    await saveManifest(manifestPath, manifest);
    spinner.succeed(`Updated ${updatedCount} prompt(s)`);
    
    if (updatedCount < updates.length) {
      console.log(chalk.yellow(`\n⚠️  ${updates.length - updatedCount} prompt(s) were skipped due to local modifications.`));
      console.log(chalk.gray('Use --force to overwrite local changes.'));
    }
    
    console.log(chalk.green('\n✅ Update complete!'));
    
  } catch (error) {
    spinner.fail('Update failed');
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}