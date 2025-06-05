#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { update } from './commands/update.js';
import { list } from './commands/list.js';
import { getPackageJson } from './utils/package.js';

const packageJson = await getPackageJson();

const program = new Command()
  .name('create-mg-prompts')
  .description('CLI tool to manage and install MG AI prompts')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize prompts in your project')
  .option('-p, --path <path>', 'custom path for prompts (default: .ai/prompts)')
  .option('-f, --force', 'overwrite existing prompts')
  .option('-g, --global', 'install to Claude Code global config')
  .option('-y, --yes', 'automatic yes to prompts (non-interactive mode)')
  .action(init);

program
  .command('update')
  .description('Update installed prompts to latest versions')
  .option('-f, --force', 'force update even if local changes exist')
  .action(update);

program
  .command('list')
  .description('List available prompts')
  .option('-i, --installed', 'show only installed prompts')
  .action(list);

// Default action when no command is specified
program
  .action(() => {
    // Run init by default
    init({});
  });

program.parse();