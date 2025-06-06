import { describe, it, expect, beforeEach, vi } from 'vitest';
import { homedir, platform } from 'os';
import { join } from 'path';
import { detectClaudeCodePath, getDefaultPromptsPath, getManifestPath } from '../../utils/paths.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';

vi.mock('os');

describe('paths utilities', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
  });

  describe('detectClaudeCodePath', () => {
    it('should detect Claude Code path on macOS', async () => {
      vi.mocked(platform).mockReturnValue('darwin');
      vi.mocked(homedir).mockReturnValue('/Users/test');
      
      const expectedPath = '/Users/test/Library/Application Support/Claude';
      setupFileSystem({
        [expectedPath]: '',
      });

      const result = await detectClaudeCodePath();
      expect(result).toBe(expectedPath);
    });

    it('should detect Claude Code path on Windows', async () => {
      vi.mocked(platform).mockReturnValue('win32');
      vi.mocked(homedir).mockReturnValue('C:\\Users\\test');
      
      const expectedPath = join('C:\\Users\\test', 'AppData', 'Roaming', 'Claude');
      setupFileSystem({
        [expectedPath]: '',
      });

      const result = await detectClaudeCodePath();
      expect(result).toBe(expectedPath);
    });

    it('should detect Claude Code path on Linux with XDG_CONFIG_HOME', async () => {
      vi.mocked(platform).mockReturnValue('linux');
      vi.mocked(homedir).mockReturnValue('/home/test');
      process.env.XDG_CONFIG_HOME = '/home/test/.config';
      
      const expectedPath = '/home/test/.config/claude';
      setupFileSystem({
        [expectedPath]: '',
      });

      const result = await detectClaudeCodePath();
      expect(result).toBe(expectedPath);
      
      delete process.env.XDG_CONFIG_HOME;
    });

    it('should detect Claude Code path on Linux without XDG_CONFIG_HOME', async () => {
      vi.mocked(platform).mockReturnValue('linux');
      vi.mocked(homedir).mockReturnValue('/home/test');
      delete process.env.XDG_CONFIG_HOME;
      
      const expectedPath = '/home/test/.config/claude';
      setupFileSystem({
        [expectedPath]: '',
      });

      const result = await detectClaudeCodePath();
      expect(result).toBe(expectedPath);
    });

    it('should return null if Claude Code is not found', async () => {
      vi.mocked(platform).mockReturnValue('darwin');
      vi.mocked(homedir).mockReturnValue('/Users/test');
      
      // Don't create any directories
      setupFileSystem({});

      const result = await detectClaudeCodePath();
      expect(result).toBe(null);
    });

    it('should check alternative paths if primary not found', async () => {
      vi.mocked(platform).mockReturnValue('darwin');
      vi.mocked(homedir).mockReturnValue('/Users/test');
      
      // Create alternative path instead of primary
      const alternativePath = '/Users/test/.claude';
      setupFileSystem({
        [alternativePath]: '',
      });

      const result = await detectClaudeCodePath();
      expect(result).toBe(alternativePath);
    });
  });

  describe('getDefaultPromptsPath', () => {
    it('should return default prompts path', () => {
      const result = getDefaultPromptsPath();
      expect(result).toBe('.ai/prompts');
    });
  });

  describe('getManifestPath', () => {
    it('should return manifest path for project root', () => {
      const projectRoot = '/path/to/project';
      const result = getManifestPath(projectRoot);
      expect(result).toBe(join(projectRoot, '.ai', 'prompts.manifest.json'));
    });

    it('should handle Windows paths correctly', () => {
      const projectRoot = 'C:\\path\\to\\project';
      const result = getManifestPath(projectRoot);
      expect(result).toBe(join(projectRoot, '.ai', 'prompts.manifest.json'));
    });
  });
});