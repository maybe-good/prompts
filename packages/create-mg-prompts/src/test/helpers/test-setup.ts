import { mkdtempSync, rmSync, cpSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { vi } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface TestContext {
  tempDir: string;
  originalCwd: string;
  projectRoot: string;
}

/**
 * Creates a temporary directory and sets up test environment
 */
export function setupTestEnvironment(): TestContext {
  // Create temp directory
  const tempDir = mkdtempSync(join(tmpdir(), 'mg-prompts-test-'));
  
  // Save original cwd
  const originalCwd = process.cwd();
  
  // Create project directory within temp
  const projectRoot = join(tempDir, 'test-project');
  mkdirSync(projectRoot, { recursive: true });
  
  // Change to project directory
  process.chdir(projectRoot);
  
  return {
    tempDir,
    originalCwd,
    projectRoot
  };
}

/**
 * Cleans up test environment
 */
export function cleanupTestEnvironment(context: TestContext) {
  // Restore original cwd
  process.chdir(context.originalCwd);
  
  // Remove temp directory
  rmSync(context.tempDir, { recursive: true, force: true });
}

/**
 * Sets up test prompts in the expected location
 */
export function setupTestPrompts(context: TestContext) {
  // The source code expects prompts relative to src/utils
  // We need to create them where prompts.ts will look for them
  // prompts.ts uses __dirname which resolves to src/utils
  // and looks for ../prompts relative to that
  
  const utilsDir = join(__dirname, '../../utils');
  const promptsDir = join(utilsDir, '../prompts');
  
  // Create prompts directory
  mkdirSync(promptsDir, { recursive: true });
  mkdirSync(join(promptsDir, 'test'), { recursive: true });
  mkdirSync(join(promptsDir, 'another'), { recursive: true });
  
  // Create prompts.json
  const promptsJson = {
    prompts: [
      {
        id: 'test-prompt',
        path: 'test/test-prompt.md'
      },
      {
        id: 'another-prompt',
        path: 'another/another-prompt.md'
      }
    ]
  };
  
  writeFileSync(
    join(promptsDir, 'prompts.json'),
    JSON.stringify(promptsJson, null, 2)
  );
  
  // Create test prompt files
  const testPromptContent = `---
name: Test Prompt
version: 1.0.0
description: A test prompt for unit testing
author: Test Author
tags:
  - test
  - demo
---

# Test Prompt

This is a test prompt for unit testing.`;

  writeFileSync(
    join(promptsDir, 'test/test-prompt.md'),
    testPromptContent
  );
  
  writeFileSync(
    join(promptsDir, 'another/another-prompt.md'),
    testPromptContent.replace('Test Prompt', 'Another Prompt')
  );
}

/**
 * Sets up a basic project structure
 */
export function setupProjectStructure(context: TestContext, options: {
  includeClaudeMd?: boolean;
  claudeMdContent?: string;
  includePackageJson?: boolean;
  additionalFiles?: Record<string, string>;
} = {}) {
  // Create package.json by default
  if (options.includePackageJson !== false) {
    writeFileSync(
      join(context.projectRoot, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0'
      }, null, 2)
    );
  }
  
  // Create CLAUDE.md if requested
  if (options.includeClaudeMd) {
    const content = options.claudeMdContent || `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About You

This is where prompts will be added.
`;
    writeFileSync(join(context.projectRoot, 'CLAUDE.md'), content);
  }
  
  // Create any additional files
  if (options.additionalFiles) {
    for (const [path, content] of Object.entries(options.additionalFiles)) {
      const fullPath = join(context.projectRoot, path);
      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, content);
    }
  }
}

/**
 * Mock console methods for cleaner test output
 */
export function mockConsole() {
  const mocks = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {})
  };
  
  return mocks;
}

/**
 * Mock process.exit to prevent tests from exiting
 */
export function mockProcessExit() {
  return vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit called with code ${code}`);
  });
}