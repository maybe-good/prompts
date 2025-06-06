import { describe, it, expect, beforeEach } from 'vitest';
import { updateClaudeMd, getClaudeMdPrompts } from '../../utils/claude-md.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';
import { readFile } from 'fs/promises';

describe('claude-md utilities', () => {
  beforeEach(() => {
    resetFileSystem();
  });

  describe('updateClaudeMd', () => {
    it('should create new CLAUDE.md with prompts', async () => {
      const projectRoot = '/project';
      const promptPaths = new Map([
        ['max', '.ai/prompts/max/MAX.md'],
        ['test', '.ai/prompts/test/test.md'],
      ]);

      await updateClaudeMd(projectRoot, promptPaths);

      const content = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(content).toContain('# CLAUDE.md');
      expect(content).toContain('## About You');
      expect(content).toContain('@.ai/prompts/max/MAX.md');
      expect(content).toContain('@.ai/prompts/test/test.md');
    });

    it('should update existing CLAUDE.md preserving other content', async () => {
      const projectRoot = '/project';
      const existingContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About You

@old/prompt.md

## About the Repository

This is my awesome project.
`;

      setupFileSystem({
        '/project/CLAUDE.md': existingContent,
      });

      const promptPaths = new Map([
        ['new', '.ai/prompts/new/new.md'],
      ]);

      await updateClaudeMd(projectRoot, promptPaths);

      const content = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(content).toContain('## About You');
      expect(content).toContain('@.ai/prompts/new/new.md');
      expect(content).toContain('## About the Repository');
      expect(content).toContain('This is my awesome project');
      expect(content).not.toContain('@old/prompt.md');
    });

    it('should handle CLAUDE.md without About You section', async () => {
      const projectRoot = '/project';
      const existingContent = `# CLAUDE.md

This file provides guidance to Claude Code.

## Some Other Section

Content here.
`;

      setupFileSystem({
        '/project/CLAUDE.md': existingContent,
      });

      const promptPaths = new Map([
        ['test', '.ai/prompts/test.md'],
      ]);

      await updateClaudeMd(projectRoot, promptPaths);

      const content = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(content).toContain('## About You');
      expect(content).toContain('@.ai/prompts/test.md');
      expect(content).toContain('## Some Other Section');
    });

    it('should handle empty prompt paths map', async () => {
      const projectRoot = '/project';
      const promptPaths = new Map();

      await updateClaudeMd(projectRoot, promptPaths);

      const content = await readFile('/project/CLAUDE.md', 'utf-8');
      expect(content).toContain('# CLAUDE.md');
      expect(content).toContain('## About You');
    });

    it('should handle multiple prompts with proper formatting', async () => {
      const projectRoot = '/project';
      const promptPaths = new Map([
        ['a', '.ai/prompts/a.md'],
        ['b', '.ai/prompts/b.md'],
        ['c', '.ai/prompts/c.md'],
      ]);

      await updateClaudeMd(projectRoot, promptPaths);

      const content = await readFile('/project/CLAUDE.md', 'utf-8');
      const lines = content.split('\n');
      const aboutYouIndex = lines.findIndex(line => line === '## About You');
      
      expect(lines[aboutYouIndex + 2]).toBe('@.ai/prompts/a.md');
      expect(lines[aboutYouIndex + 3]).toBe('@.ai/prompts/b.md');
      expect(lines[aboutYouIndex + 4]).toBe('@.ai/prompts/c.md');
    });
  });

  describe('getClaudeMdPrompts', () => {
    it('should extract prompt references from CLAUDE.md', async () => {
      const content = `# CLAUDE.md

## About You

@.ai/prompts/max/MAX.md
@./prompts/test.md
@.ai/prompts/another.md

## About the Repository
`;

      setupFileSystem({
        '/project/CLAUDE.md': content,
      });

      const prompts = await getClaudeMdPrompts('/project');
      expect(prompts).toEqual([
        '.ai/prompts/max/MAX.md',
        './prompts/test.md',
        '.ai/prompts/another.md',
      ]);
    });

    it('should return empty array if CLAUDE.md does not exist', async () => {
      const prompts = await getClaudeMdPrompts('/project');
      expect(prompts).toEqual([]);
    });

    it('should handle CLAUDE.md with no prompt references', async () => {
      const content = `# CLAUDE.md

## About You

No prompts here.

## About the Repository
`;

      setupFileSystem({
        '/project/CLAUDE.md': content,
      });

      const prompts = await getClaudeMdPrompts('/project');
      expect(prompts).toEqual([]);
    });

    it('should ignore non-markdown file references', async () => {
      const content = `# CLAUDE.md

## About You

@.ai/prompts/valid.md
@./config.json
@.ai/prompts/another.md
@./script.js

## About the Repository
`;

      setupFileSystem({
        '/project/CLAUDE.md': content,
      });

      const prompts = await getClaudeMdPrompts('/project');
      expect(prompts).toEqual([
        '.ai/prompts/valid.md',
        '.ai/prompts/another.md',
      ]);
    });

    it('should handle prompt references in different formats', async () => {
      const content = `# CLAUDE.md

## About You

Some text before prompts.

@./prompts/one.md
More text @./prompts/two.md inline reference.
@.ai/prompts/three.md

## About the Repository
`;

      setupFileSystem({
        '/project/CLAUDE.md': content,
      });

      const prompts = await getClaudeMdPrompts('/project');
      expect(prompts).toEqual([
        './prompts/one.md',
        './prompts/two.md',
        '.ai/prompts/three.md',
      ]);
    });
  });
});