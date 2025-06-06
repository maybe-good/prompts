import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadAvailablePrompts, getPromptContent } from '../../utils/prompts.js';

describe('prompts utilities - real filesystem', () => {
  let tempPromptsDir: string;

  beforeEach(() => {
    // Set up test prompts in the expected location relative to utils
    const utilsDir = join(dirname(fileURLToPath(import.meta.url)), '../../utils');
    tempPromptsDir = join(utilsDir, '../prompts');
    
    // Create prompts directory structure
    mkdirSync(tempPromptsDir, { recursive: true });
    mkdirSync(join(tempPromptsDir, 'test'), { recursive: true });
    mkdirSync(join(tempPromptsDir, 'category/subcategory'), { recursive: true });
  });

  afterEach(() => {
    // Clean up - don't remove the prompts directory since it's part of the source tree
    // We'll just clean it up at the end of all tests or let git clean handle it
  });

  describe('loadAvailablePrompts', () => {
    it('should load prompts from bundled files', async () => {
      // Create test prompts.json
      const promptsJson = {
        prompts: [
          { id: 'test-prompt', path: 'test/test-prompt.md' },
          { id: 'nested-prompt', path: 'category/subcategory/prompt.md' }
        ]
      };
      
      writeFileSync(
        join(tempPromptsDir, 'prompts.json'),
        JSON.stringify(promptsJson)
      );

      // Create prompt files
      const testPromptContent = `---
name: Test Prompt
version: 1.0.0
description: A test prompt
author: Test Author
tags: [test]
---

# Test Prompt`;

      writeFileSync(
        join(tempPromptsDir, 'test/test-prompt.md'),
        testPromptContent
      );

      writeFileSync(
        join(tempPromptsDir, 'category/subcategory/prompt.md'),
        testPromptContent.replace('Test Prompt', 'Nested Prompt')
      );

      const prompts = await loadAvailablePrompts();

      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toEqual({
        id: 'test-prompt',
        path: 'test/test-prompt.md',
        metadata: {
          name: 'Test Prompt',
          version: '1.0.0',
          description: 'A test prompt',
          author: 'Test Author',
          tags: ['test']
        }
      });
    });

    it('should handle empty prompts list', async () => {
      writeFileSync(
        join(tempPromptsDir, 'prompts.json'),
        JSON.stringify({ prompts: [] })
      );

      const prompts = await loadAvailablePrompts();
      expect(prompts).toEqual([]);
    });

    it('should skip prompts that cannot be loaded', async () => {
      const promptsJson = {
        prompts: [
          { id: 'exists', path: 'test/exists.md' },
          { id: 'missing', path: 'test/missing.md' }
        ]
      };
      
      writeFileSync(
        join(tempPromptsDir, 'prompts.json'),
        JSON.stringify(promptsJson)
      );

      // Only create one file
      writeFileSync(
        join(tempPromptsDir, 'test/exists.md'),
        `---
name: Exists
version: 1.0.0
---`
      );

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const prompts = await loadAvailablePrompts();
      
      expect(prompts).toHaveLength(1);
      expect(prompts[0].id).toBe('exists');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not load prompt missing')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('getPromptContent', () => {
    it('should read prompt content from bundled location', async () => {
      const content = '# Test Content\n\nThis is test content.';
      writeFileSync(
        join(tempPromptsDir, 'test/test.md'),
        content
      );

      const result = await getPromptContent('test/test.md');
      expect(result).toBe(content);
    });

    it('should handle nested prompt paths', async () => {
      const content = '# Nested Content';
      mkdirSync(join(tempPromptsDir, 'a/b/c'), { recursive: true });
      writeFileSync(
        join(tempPromptsDir, 'a/b/c/nested.md'),
        content
      );

      const result = await getPromptContent('a/b/c/nested.md');
      expect(result).toBe(content);
    });

    it('should throw error for non-existent prompt', async () => {
      await expect(getPromptContent('does/not/exist.md')).rejects.toThrow();
    });

    it('should preserve exact content including whitespace', async () => {
      const content = '  # Header\n\n\tIndented\n  \nTrailing spaces  \n';
      writeFileSync(
        join(tempPromptsDir, 'whitespace.md'),
        content
      );

      const result = await getPromptContent('whitespace.md');
      expect(result).toBe(content);
    });
  });
});