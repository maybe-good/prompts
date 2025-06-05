import chalk from 'chalk';
import { loadAvailablePrompts } from '../utils/prompts.js';
import { findProjectRoot } from '../utils/project.js';
import { getManifestPath } from '../utils/paths.js';
import { loadManifest } from '../utils/manifest.js';

interface ListOptions {
  installed?: boolean;
}

export async function list(options: ListOptions) {
  try {
    if (options.installed) {
      // Show installed prompts
      const projectRoot = await findProjectRoot();
      const manifestPath = getManifestPath(projectRoot);
      const manifest = await loadManifest(manifestPath);
      
      if (!manifest || manifest.prompts.length === 0) {
        console.log(chalk.yellow('No prompts installed in this project.'));
        return;
      }
      
      console.log(chalk.blue('\n📦 Installed Prompts:\n'));
      
      manifest.prompts.forEach(prompt => {
        const status = prompt.modified ? chalk.yellow(' (modified)') : '';
        console.log(`  ${chalk.green('●')} ${prompt.id} (v${prompt.version})${status}`);
        console.log(`     Installed: ${new Date(prompt.installedAt).toLocaleDateString()}`);
      });
    } else {
      // Show all available prompts
      const prompts = await loadAvailablePrompts();
      
      console.log(chalk.blue('\n📚 Available Prompts:\n'));
      
      prompts.forEach(prompt => {
        console.log(`  ${chalk.green('●')} ${chalk.bold(prompt.metadata.name)} (v${prompt.metadata.version})`);
        console.log(`     ${prompt.metadata.description}`);
        console.log(`     Tags: ${prompt.metadata.tags.join(', ')}`);
        console.log(`     Author: ${prompt.metadata.author}\n`);
      });
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error);
    process.exit(1);
  }
}