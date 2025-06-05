import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAvailablePrompts, getPromptContent } from '../../utils/prompts.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';
import { mockPromptContent, mockPromptsJson } from '../fixtures/prompts.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('prompts utilities', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
  });

  describe('loadAvailablePrompts', () => {
    it('should load prompts from bundled files', async () => {
      // Mock the bundled prompts location
      const promptsPath = join(__dirname, '../../prompts/prompts.json');
      const prompt1Path = join(__dirname, '../../prompts/test/test-prompt.md');
      const prompt2Path = join(__dirname, '../../prompts/another/another-prompt.md');

      setupFileSystem({
        [promptsPath]: JSON.stringify(mockPromptsJson),
        [prompt1Path]: mockPromptContent,
        [prompt2Path]: mockPromptContent.replace('Test Prompt', 'Another Prompt'),
      });

      const prompts = await loadAvailablePrompts();
      
      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toEqual({
        id: 'test-prompt',
        path: 'test/test-prompt.md',
        metadata: {
          name: 'Test Prompt',
          version: '1.0.0',
          description: 'A test prompt for unit testing',
          author: 'Test Author',
          tags: ['test', 'mock'],
        },
      });
    });

    it('should parse frontmatter correctly', async () => {
      const promptsPath = join(__dirname, '../../prompts/prompts.json');
      const promptPath = join(__dirname, '../../prompts/test/test.md');

      const customPromptContent = `---
name: Custom Prompt
version: 2.1.0
description: A custom test prompt
author: Custom Author
tags:
  - custom
  - advanced
  - testing
---

# Custom Prompt Content`;

      setupFileSystem({
        [promptsPath]: JSON.stringify({
          prompts: [{
            id: 'custom',
            path: 'test/test.md',
          }],
        }),
        [promptPath]: customPromptContent,
      });

      const prompts = await loadAvailablePrompts();
      
      expect(prompts[0].metadata).toEqual({
        name: 'Custom Prompt',
        version: '2.1.0',
        description: 'A custom test prompt',
        author: 'Custom Author',
        tags: ['custom', 'advanced', 'testing'],
      });
    });

    it('should handle empty prompts list', async () => {
      const promptsPath = join(__dirname, '../../prompts/prompts.json');

      setupFileSystem({
        [promptsPath]: JSON.stringify({ prompts: [] }),
      });

      const prompts = await loadAvailablePrompts();
      expect(prompts).toEqual([]);
    });

    it('should handle missing prompt files gracefully', async () => {
      const promptsPath = join(__dirname, '../../prompts/prompts.json');

      setupFileSystem({
        [promptsPath]: JSON.stringify({
          prompts: [{
            id: 'missing',
            path: 'missing/missing.md',
          }],
        }),
        // Don't create the actual prompt file
      });

      await expect(loadAvailablePrompts()).rejects.toThrow();
    });
  });

  describe('getPromptContent', () => {
    it('should read prompt content from bundled location', async () => {
      const promptPath = 'test/test-prompt.md';
      const fullPath = join(__dirname, '../../prompts', promptPath);

      setupFileSystem({
        [fullPath]: mockPromptContent,
      });

      const content = await getPromptContent(promptPath);
      expect(content).toBe(mockPromptContent);
    });

    it('should handle nested prompt paths', async () => {
      const promptPath = 'category/subcategory/prompt.md';
      const fullPath = join(__dirname, '../../prompts', promptPath);
      const content = '# Nested Prompt';

      setupFileSystem({
        [fullPath]: content,
      });

      const result = await getPromptContent(promptPath);
      expect(result).toBe(content);
    });

    it('should throw error for non-existent prompt', async () => {
      await expect(getPromptContent('nonexistent/prompt.md')).rejects.toThrow();
    });

    it('should preserve exact content including whitespace', async () => {
      const promptPath = 'test/whitespace.md';
      const fullPath = join(__dirname, '../../prompts', promptPath);
      const content = '# Title\n\n  Indented content\n\n\nMultiple newlines\n';

      setupFileSystem({
        [fullPath]: content,
      });

      const result = await getPromptContent(promptPath);
      expect(result).toBe(content);
    });
  });
});