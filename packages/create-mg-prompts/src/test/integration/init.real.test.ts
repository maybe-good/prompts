import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { 
  setupTestEnvironment, 
  cleanupTestEnvironment,
  setupTestPrompts,
  setupProjectStructure,
  mockConsole,
  mockProcessExit,
  type TestContext
} from '../helpers/test-setup.js';
import { init } from '../../commands/init.js';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

describe('init command - real filesystem', () => {
  let context: TestContext;
  let consoleMocks: ReturnType<typeof mockConsole>;
  let exitMock: ReturnType<typeof mockProcessExit>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up test environment
    context = setupTestEnvironment();
    setupTestPrompts(context);
    
    // Mock console and process.exit
    consoleMocks = mockConsole();
    // exitMock = mockProcessExit(); // Temporarily disable to see real error
  });

  afterEach(() => {
    cleanupTestEnvironment(context);
    vi.restoreAllMocks();
  });

  describe('local installation', () => {
    it('should install all prompts with --yes flag', async () => {
      setupProjectStructure(context);

      try {
        await init({ yes: true });
      } catch (error) {
        // Log the actual error for debugging
        console.error('Init failed with error:', error);
        throw error;
      }

      // Check manifest was created
      const manifestPath = join(context.projectRoot, '.ai/prompts.manifest.json');
      expect(existsSync(manifestPath)).toBe(true);
      
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.prompts).toHaveLength(2);
      expect(manifest.prompts[0].id).toBe('test-prompt');
      expect(manifest.prompts[0].version).toBe('1.0.0');

      // Check prompt files were copied
      const promptPath = join(context.projectRoot, '.ai/prompts/test/test-prompt.md');
      expect(existsSync(promptPath)).toBe(true);
      
      const promptContent = readFileSync(promptPath, 'utf-8');
      expect(promptContent).toContain('# Test Prompt');

      // Check CLAUDE.md was created and updated
      const claudeMdPath = join(context.projectRoot, 'CLAUDE.md');
      expect(existsSync(claudeMdPath)).toBe(true);
      
      const claudeMd = readFileSync(claudeMdPath, 'utf-8');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
      expect(claudeMd).toContain('@.ai/prompts/another/another-prompt.md');
    });

    it('should install selected prompts interactively', async () => {
      setupProjectStructure(context);

      // Mock user selecting only one prompt
      vi.mocked(inquirer.prompt).mockResolvedValue({
        promptIds: ['test-prompt']
      });

      await init({});

      // Check only selected prompt was installed
      const manifest = JSON.parse(
        readFileSync(join(context.projectRoot, '.ai/prompts.manifest.json'), 'utf-8')
      );
      expect(manifest.prompts).toHaveLength(1);
      expect(manifest.prompts[0].id).toBe('test-prompt');

      // Check only selected file exists
      expect(existsSync(join(context.projectRoot, '.ai/prompts/test/test-prompt.md'))).toBe(true);
      expect(existsSync(join(context.projectRoot, '.ai/prompts/another/another-prompt.md'))).toBe(false);
    });

    it('should handle existing CLAUDE.md', async () => {
      const existingContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About You

Some existing content here.

## Other Section

This should be preserved.`;

      setupProjectStructure(context, {
        includeClaudeMd: true,
        claudeMdContent: existingContent
      });

      await init({ yes: true });

      const claudeMd = readFileSync(join(context.projectRoot, 'CLAUDE.md'), 'utf-8');
      
      // Should replace About You section content
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
      expect(claudeMd).not.toContain('Some existing content here');
      
      // Should preserve other sections
      expect(claudeMd).toContain('## Other Section');
      expect(claudeMd).toContain('This should be preserved');
    });

    it('should skip existing files without --force', async () => {
      setupProjectStructure(context, {
        additionalFiles: {
          '.ai/prompts/test/test-prompt.md': 'Existing content - do not overwrite'
        }
      });

      await init({ yes: true });

      // Check existing file was not overwritten
      const content = readFileSync(
        join(context.projectRoot, '.ai/prompts/test/test-prompt.md'),
        'utf-8'
      );
      expect(content).toBe('Existing content - do not overwrite');

      // Check manifest still tracks the prompt
      const manifest = JSON.parse(
        readFileSync(join(context.projectRoot, '.ai/prompts.manifest.json'), 'utf-8')
      );
      expect(manifest.prompts.find((p: any) => p.id === 'test-prompt')).toBeTruthy();
    });

    it('should overwrite existing files with --force', async () => {
      setupProjectStructure(context, {
        additionalFiles: {
          '.ai/prompts/test/test-prompt.md': 'Old content'
        }
      });

      await init({ yes: true, force: true });

      // Check file was overwritten
      const content = readFileSync(
        join(context.projectRoot, '.ai/prompts/test/test-prompt.md'),
        'utf-8'
      );
      expect(content).toContain('# Test Prompt');
      expect(content).not.toContain('Old content');
    });

    it('should handle custom installation path', async () => {
      setupProjectStructure(context);

      await init({ yes: true, path: 'custom/prompts' });

      // Check files were installed to custom path
      expect(existsSync(join(context.projectRoot, 'custom/prompts/test/test-prompt.md'))).toBe(true);
      expect(existsSync(join(context.projectRoot, '.ai/prompts/test/test-prompt.md'))).toBe(false);

      // Check CLAUDE.md references custom path
      const claudeMd = readFileSync(join(context.projectRoot, 'CLAUDE.md'), 'utf-8');
      expect(claudeMd).toContain('@custom/prompts/test/test-prompt.md');
    });

    it('should create CLAUDE.md when confirmed', async () => {
      setupProjectStructure(context);

      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ promptIds: ['test-prompt'] })
        .mockResolvedValueOnce({ createClaudeMd: true });

      await init({});

      expect(existsSync(join(context.projectRoot, 'CLAUDE.md'))).toBe(true);
      
      const claudeMd = readFileSync(join(context.projectRoot, 'CLAUDE.md'), 'utf-8');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
    });

    it('should not create CLAUDE.md when declined', async () => {
      setupProjectStructure(context);

      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ promptIds: ['test-prompt'] })
        .mockResolvedValueOnce({ createClaudeMd: false });

      await init({});

      expect(existsSync(join(context.projectRoot, 'CLAUDE.md'))).toBe(false);
    });
  });

  describe('global installation', () => {
    it('should detect Claude Code path and install globally', async () => {
      // Create a fake Claude Code directory
      const claudeDir = join(context.tempDir, 'Library/Application Support/Claude');
      mkdirSync(claudeDir, { recursive: true });
      
      // Mock homedir to return temp directory
      vi.spyOn(os, 'homedir').mockReturnValue(context.tempDir);

      await init({ global: true, yes: true });

      // Check prompts were installed to Claude directory
      expect(existsSync(join(claudeDir, 'prompts/test/test-prompt.md'))).toBe(true);
      
      // Check manifest in Claude directory
      const manifest = JSON.parse(
        readFileSync(join(claudeDir, '.ai/prompts.manifest.json'), 'utf-8')
      );
      expect(manifest.prompts).toHaveLength(2);
    });

    it('should fail gracefully when Claude Code not detected', async () => {
      // Don't create Claude directory
      vi.spyOn(os, 'homedir').mockReturnValue(context.tempDir);

      await expect(init({ global: true })).rejects.toThrow('process.exit called with code 1');
      
      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Could not detect Claude Code')
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing prompts.json', async () => {
      setupProjectStructure(context);
      
      // Remove prompts.json to simulate error
      const distDir = join(dirname(require.resolve('../../index.js')), '..');
      rmSync(join(distDir, 'prompts/prompts.json'));

      await expect(init({ yes: true })).rejects.toThrow('process.exit called with code 1');
      expect(consoleMocks.error).toHaveBeenCalled();
    });
  });
});

// Import os for mocking
import os from 'os';
import { mkdirSync, rmSync } from 'fs';