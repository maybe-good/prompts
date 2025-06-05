import { describe, it, expect, beforeEach } from 'vitest';
import { loadManifest, saveManifest, checkFileModified } from '../../utils/manifest.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';
import { mockManifest } from '../fixtures/prompts.js';

describe('manifest utilities', () => {
  beforeEach(() => {
    resetFileSystem();
  });

  describe('loadManifest', () => {
    it('should load existing manifest', async () => {
      const manifestPath = '/project/.ai/prompts.manifest.json';
      setupFileSystem({
        [manifestPath]: JSON.stringify(mockManifest),
      });

      const result = await loadManifest(manifestPath);
      expect(result).toEqual(mockManifest);
    });

    it('should return null if manifest does not exist', async () => {
      const result = await loadManifest('/nonexistent/manifest.json');
      expect(result).toBe(null);
    });

    it('should handle malformed JSON gracefully', async () => {
      const manifestPath = '/project/.ai/prompts.manifest.json';
      setupFileSystem({
        [manifestPath]: 'invalid json',
      });

      await expect(loadManifest(manifestPath)).rejects.toThrow();
    });
  });

  describe('saveManifest', () => {
    it('should save manifest with proper formatting', async () => {
      const manifestPath = '/project/.ai/prompts.manifest.json';
      
      await saveManifest(manifestPath, mockManifest);
      
      const saved = await loadManifest(manifestPath);
      expect(saved).toEqual(mockManifest);
    });

    it('should create directory if it does not exist', async () => {
      const manifestPath = '/new/project/.ai/prompts.manifest.json';
      
      await saveManifest(manifestPath, mockManifest);
      
      const saved = await loadManifest(manifestPath);
      expect(saved).toEqual(mockManifest);
    });

    it('should overwrite existing manifest', async () => {
      const manifestPath = '/project/.ai/prompts.manifest.json';
      const oldManifest = { version: '0.0.1', prompts: [] };
      
      setupFileSystem({
        [manifestPath]: JSON.stringify(oldManifest),
      });

      await saveManifest(manifestPath, mockManifest);
      
      const saved = await loadManifest(manifestPath);
      expect(saved).toEqual(mockManifest);
      expect(saved).not.toEqual(oldManifest);
    });
  });

  describe('checkFileModified', () => {
    it('should return false if file content matches', async () => {
      const filePath = '/project/test.md';
      const content = 'Original content';
      
      setupFileSystem({
        [filePath]: content,
      });

      const result = await checkFileModified(filePath, content);
      expect(result).toBe(false);
    });

    it('should return true if file content differs', async () => {
      const filePath = '/project/test.md';
      const originalContent = 'Original content';
      const modifiedContent = 'Modified content';
      
      setupFileSystem({
        [filePath]: modifiedContent,
      });

      const result = await checkFileModified(filePath, originalContent);
      expect(result).toBe(true);
    });

    it('should return true if file does not exist', async () => {
      const result = await checkFileModified('/nonexistent/file.md', 'content');
      expect(result).toBe(true);
    });

    it('should handle whitespace differences', async () => {
      const filePath = '/project/test.md';
      const originalContent = 'Line 1\nLine 2\n';
      const modifiedContent = 'Line 1\nLine 2\n\n'; // Extra newline
      
      setupFileSystem({
        [filePath]: modifiedContent,
      });

      const result = await checkFileModified(filePath, originalContent);
      expect(result).toBe(true);
    });

    it('should handle empty files', async () => {
      const filePath = '/project/empty.md';
      
      setupFileSystem({
        [filePath]: '',
      });

      const result = await checkFileModified(filePath, '');
      expect(result).toBe(false);
    });
  });
});