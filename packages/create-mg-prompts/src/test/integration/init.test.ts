import { describe, it, expect, beforeEach, vi } from 'vitest';
import { init } from '../../commands/init.js';
import { resetFileSystem, setupFileSystem, mockInquirer, mockOra } from '../setup.js';
import { mockPromptContent, mockPromptsJson } from '../fixtures/prompts.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock console methods
const mockConsole = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

// Mock process.exit
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('Process exit');
});

describe('init command integration', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
    mockConsole.log.mockClear();
    mockConsole.error.mockClear();
    mockExit.mockClear();
  });

  describe('local installation', () => {
    beforeEach(() => {
      // Setup bundled prompts
      const promptsPath = join(__dirname, '../../prompts/prompts.json');
      const promptPath = join(__dirname, '../../prompts/test/test-prompt.md');

      setupFileSystem({
        [promptsPath]: JSON.stringify(mockPromptsJson),
        [promptPath]: mockPromptContent,
        [join(__dirname, '../../prompts/another/another-prompt.md')]: mockPromptContent,
        '/project/package.json': '{}',
      });
    });

    it('should install prompts interactively', async () => {
      mockInquirer({
        promptIds: ['test-prompt'],
      });
      mockOra();

      await init({});

      // Check manifest was created
      const manifest = JSON.parse(await readFile('/project/.ai/prompts.manifest.json', 'utf-8'));
      expect(manifest.prompts).toHaveLength(1);
      expect(manifest.prompts[0].id).toBe('test-prompt');
      expect(manifest.prompts[0].version).toBe('1.0.0');

      // Check prompt was copied
      const promptContent = await readFile('/project/.ai/prompts/test/test-prompt.md', 'utf-8');
      expect(promptContent).toBe(mockPromptContent);

      // Check CLAUDE.md was updated
      const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
    });

    it('should install all prompts with --yes flag', async () => {
      mockOra();

      await init({ yes: true });

      // Check manifest
      const manifest = JSON.parse(await readFile('/project/.ai/prompts.manifest.json', 'utf-8'));
      expect(manifest.prompts).toHaveLength(2);

      // Check both prompts were copied
      const prompt1 = await readFile('/project/.ai/prompts/test/test-prompt.md', 'utf-8');
      const prompt2 = await readFile('/project/.ai/prompts/another/another-prompt.md', 'utf-8');
      expect(prompt1).toBeTruthy();
      expect(prompt2).toBeTruthy();

      // Check CLAUDE.md
      const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
      expect(claudeMd).toContain('@.ai/prompts/another/another-prompt.md');
    });

    it('should handle existing CLAUDE.md', async () => {
      const existingClaudeMd = `# CLAUDE.md

## About You

@old/prompt.md

## Project Info

This is my project.`;

      setupFileSystem({
        '/project/CLAUDE.md': existingClaudeMd,
      });

      mockInquirer({
        promptIds: ['test-prompt'],
      });
      mockOra();

      await init({});

      const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
      expect(claudeMd).not.toContain('@old/prompt.md');
      expect(claudeMd).toContain('## Project Info');
      expect(claudeMd).toContain('This is my project');
    });

    it('should handle custom installation path', async () => {
      mockInquirer({
        promptIds: ['test-prompt'],
      });
      mockOra();

      await init({ path: 'custom/prompts' });

      // Check prompt was installed to custom path
      const promptContent = await readFile('/project/custom/prompts/test/test-prompt.md', 'utf-8');
      expect(promptContent).toBe(mockPromptContent);

      // Check CLAUDE.md references custom path
      const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(claudeMd).toContain('@custom/prompts/test/test-prompt.md');
    });

    it('should handle file conflicts with --force', async () => {
      // Create existing prompt file
      setupFileSystem({
        '/project/.ai/prompts/test/test-prompt.md': 'Old content',
      });

      mockInquirer({
        promptIds: ['test-prompt'],
      });
      mockOra();

      await init({ force: true });

      // Check file was overwritten
      const promptContent = await readFile('/project/.ai/prompts/test/test-prompt.md', 'utf-8');
      expect(promptContent).toBe(mockPromptContent);
    });

    it('should skip existing files without --force when using --yes', async () => {
      // Create existing prompt file
      setupFileSystem({
        '/project/.ai/prompts/test/test-prompt.md': 'Existing content',
      });

      mockOra();

      await init({ yes: true });

      // Check file was not overwritten
      const promptContent = await readFile('/project/.ai/prompts/test/test-prompt.md', 'utf-8');
      expect(promptContent).toBe('Existing content');

      // Check console output
      expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('Skipping existing files'));
    });

    it('should create CLAUDE.md if not exists and user confirms', async () => {
      mockInquirer({
        promptIds: ['test-prompt'],
        createClaudeMd: true,
      });
      mockOra();

      await init({});

      const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(claudeMd).toContain('# CLAUDE.md');
      expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
    });
  });

  describe('global installation', () => {
    it('should detect Claude Code path and install globally', async () => {
      const claudePath = '/home/user/.config/claude';
      
      vi.doMock('os', () => ({
        platform: () => 'linux',
        homedir: () => '/home/user',
      }));

      setupFileSystem({
        [claudePath]: '', // Claude Code directory exists
        // Bundled prompts
        [join(__dirname, '../../prompts/prompts.json')]: JSON.stringify(mockPromptsJson),
        [join(__dirname, '../../prompts/test/test-prompt.md')]: mockPromptContent,
      });

      mockInquirer({
        promptIds: ['test-prompt'],
      });
      mockOra();

      await init({ global: true });

      // Check prompt was installed globally
      const promptContent = await readFile(`${claudePath}/prompts/test/test-prompt.md`, 'utf-8');
      expect(promptContent).toBe(mockPromptContent);

      // Check manifest in global location
      const manifest = JSON.parse(await readFile(`${claudePath}/.ai/prompts.manifest.json`, 'utf-8'));
      expect(manifest.prompts[0].id).toBe('test-prompt');

      // Should not create CLAUDE.md for global install
      await expect(readFile(`${claudePath}/CLAUDE.md`, 'utf-8')).rejects.toThrow();
    });

    it('should fail gracefully if Claude Code not detected', async () => {
      vi.doMock('os', () => ({
        platform: () => 'linux',
        homedir: () => '/home/user',
      }));

      setupFileSystem({
        // No Claude Code directory
      });

      mockOra();

      await expect(init({ global: true })).rejects.toThrow('Process exit');
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('Could not detect Claude Code installation')
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing prompts.json', async () => {
      setupFileSystem({
        '/project/package.json': '{}',
        // No prompts.json
      });

      mockOra();

      await expect(init({})).rejects.toThrow();
    });

    it('should handle corrupted prompt files', async () => {
      setupFileSystem({
        [join(__dirname, '../../prompts/prompts.json')]: JSON.stringify(mockPromptsJson),
        [join(__dirname, '../../prompts/test/test-prompt.md')]: 'Invalid frontmatter',
        '/project/package.json': '{}',
      });

      mockOra();

      await expect(init({})).rejects.toThrow();
    });
  });
});