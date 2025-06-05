import { join, dirname } from 'path';
import { pathExists } from 'fs-extra';

const PROJECT_ROOT_INDICATORS = [
  'package.json',
  'CLAUDE.md',
  '.git',
  'pnpm-workspace.yaml',
  'yarn.lock',
  'package-lock.json',
  'pnpm-lock.yaml',
  '.gitignore',
  'tsconfig.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
];

export async function findProjectRoot(startPath: string = process.cwd()): Promise<string> {
  let currentPath = startPath;
  
  // Check current directory first
  for (const indicator of PROJECT_ROOT_INDICATORS) {
    if (await pathExists(join(currentPath, indicator))) {
      return currentPath;
    }
  }
  
  // Walk up the directory tree
  while (currentPath !== dirname(currentPath)) {
    currentPath = dirname(currentPath);
    
    for (const indicator of PROJECT_ROOT_INDICATORS) {
      if (await pathExists(join(currentPath, indicator))) {
        return currentPath;
      }
    }
  }
  
  // If no project root found, use the starting directory
  return startPath;
}