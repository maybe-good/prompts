import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { pathExists, ensureDir, writeFile, readFile, copy } from 'fs-extra';
import { findProjectRoot } from '../utils/project.js';
import { detectClaudeCodePath, getDefaultPromptsPath, getManifestPath } from '../utils/paths.js';
import { loadAvailablePrompts, getPromptContent } from '../utils/prompts.js';
import { updateClaudeMd } from '../utils/claude-md.js';
import { loadManifest, saveManifest } from '../utils/manifest.js';
import type { Prompt, PromptManifest, InstalledPrompt } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InitOptions {
  path?: string;
  force?: boolean;
  yes?: boolean;
  global?: boolean;
}

export async function init(options: InitOptions) {
  const spinner = ora();
  
  try {
    // Determine installation mode
    const isGlobal = options.global;
    
    let targetPath: string;
    let projectRoot: string;
    
    if (isGlobal) {
      // Global installation to Claude Code config
      const claudePath = await detectClaudeCodePath();
      
      if (!claudePath) {
        console.error(chalk.red('❌ Could not detect Claude Code installation path.'));
        console.log(chalk.yellow('Please ensure Claude Code is installed.'));
        process.exit(1);
      }
      
      targetPath = join(claudePath, 'prompts');
      projectRoot = claudePath;
      
      console.log(chalk.blue(`📍 Installing to Claude Code global config: ${targetPath}`));
    } else {
      // Local project installation
      projectRoot = await findProjectRoot();
      targetPath = join(projectRoot, options.path || getDefaultPromptsPath());
      
      console.log(chalk.blue(`📍 Installing to project: ${targetPath}`));
    }
    
    // Load available prompts
    spinner.start('Loading available prompts...');
    const availablePrompts = await loadAvailablePrompts();
    spinner.succeed('Loaded available prompts');
    
    // Load existing manifest if any
    const manifestPath = getManifestPath(projectRoot);
    const existingManifest = await loadManifest(manifestPath);
    const installedPromptIds = new Set(existingManifest?.prompts.map(p => p.id) || []);
    
    // Select prompts
    let selectedPrompts: Prompt[];
    
    if (!options.yes) {
      const choices = availablePrompts.map(prompt => ({
        name: `${prompt.metadata.name} (v${prompt.metadata.version}) - ${prompt.metadata.description}`,
        value: prompt.id,
        checked: installedPromptIds.has(prompt.id)
      }));
      
      const { promptIds } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'promptIds',
          message: 'Select prompts to install:',
          choices,
          validate: (input) => input.length > 0 || 'Please select at least one prompt'
        }
      ]);
      
      selectedPrompts = availablePrompts.filter(p => promptIds.includes(p.id));
    } else {
      // Install all prompts in non-interactive mode
      selectedPrompts = availablePrompts;
    }
    
    if (selectedPrompts.length === 0) {
      console.log(chalk.yellow('No prompts selected.'));
      return;
    }
    
    // Check for existing files
    const conflicts: string[] = [];
    for (const prompt of selectedPrompts) {
      const promptTargetPath = join(targetPath, prompt.path);
      if (await pathExists(promptTargetPath) && !options.force) {
        conflicts.push(prompt.path);
      }
    }
    
    if (conflicts.length > 0 && !options.force) {
      console.log(chalk.yellow('\n⚠️  The following files already exist:'));
      conflicts.forEach(file => console.log(chalk.yellow(`  - ${file}`)));
      
      if (!options.yes) {
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Overwrite existing files?',
            default: false
          }
        ]);
        
        if (!proceed) {
          console.log(chalk.red('Installation cancelled.'));
          return;
        }
      } else {
        console.log(chalk.yellow('Skipping existing files (use --force to overwrite).'));
        // Filter out conflicting prompts
        selectedPrompts = selectedPrompts.filter(p => !conflicts.includes(p.path));
      }
    }
    
    // Create target directory
    await ensureDir(targetPath);
    
    // Copy prompts
    spinner.start('Installing prompts...');
    const installedPrompts: InstalledPrompt[] = [];
    const promptPaths = new Map<string, string>();
    
    for (const prompt of selectedPrompts) {
      const sourcePath = join(__dirname, 'prompts', prompt.path);
      const promptTargetPath = join(targetPath, prompt.path);
      
      await ensureDir(dirname(promptTargetPath));
      await copy(sourcePath, promptTargetPath, { overwrite: options.force });
      
      installedPrompts.push({
        id: prompt.id,
        version: prompt.metadata.version,
        installedAt: new Date().toISOString(),
        modified: false
      });
      
      // Store relative path for CLAUDE.md
      const relativePath = join(options.path || getDefaultPromptsPath(), prompt.path);
      promptPaths.set(prompt.id, relativePath);
    }
    
    spinner.succeed(`Installed ${selectedPrompts.length} prompt(s)`);
    
    // Update manifest
    const newManifest: PromptManifest = {
      version: '1.0.0',
      prompts: [
        ...(existingManifest?.prompts.filter(p => !selectedPrompts.some(sp => sp.id === p.id)) || []),
        ...installedPrompts
      ]
    };
    
    await saveManifest(manifestPath, newManifest);
    
    // Update CLAUDE.md for local installations
    if (!isGlobal) {
      const claudeMdPath = join(projectRoot, 'CLAUDE.md');
      
      if (!await pathExists(claudeMdPath)) {
        let createClaudeMd = true;
        
        if (!options.yes) {
          const response = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'createClaudeMd',
              message: 'CLAUDE.md not found. Would you like to create one?',
              default: true
            }
          ]);
          createClaudeMd = response.createClaudeMd;
        }
        
        if (!createClaudeMd) {
          console.log(chalk.green('\n✅ Prompts installed successfully!'));
          return;
        }
      }
      
      spinner.start('Updating CLAUDE.md...');
      await updateClaudeMd(projectRoot, promptPaths);
      spinner.succeed('Updated CLAUDE.md');
    }
    
    // Success message
    console.log(chalk.green('\n✅ Installation complete!'));
    console.log(chalk.gray('\nInstalled prompts:'));
    selectedPrompts.forEach(prompt => {
      console.log(chalk.gray(`  - ${prompt.metadata.name} (v${prompt.metadata.version})`));
    });
    
    if (!isGlobal) {
      console.log(chalk.gray(`\nPrompts are available in: ${targetPath}`));
      console.log(chalk.gray(`CLAUDE.md has been updated with prompt references.`));
    }
    
  } catch (error) {
    spinner.fail('Installation failed');
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}