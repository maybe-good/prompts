import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findProjectRoot } from '../../utils/project.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';

describe('project utilities', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
  });

  describe('findProjectRoot', () => {
    it('should find project root with package.json', async () => {
      setupFileSystem({
        '/project/package.json': '{}',
        '/project/src/index.ts': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should find project root with CLAUDE.md', async () => {
      setupFileSystem({
        '/project/CLAUDE.md': '# CLAUDE.md',
        '/project/src/index.ts': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should find project root with .git directory', async () => {
      setupFileSystem({
        '/project/.git/config': '',
        '/project/src/index.ts': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should find project root with multiple indicators', async () => {
      setupFileSystem({
        '/project/package.json': '{}',
        '/project/.git/config': '',
        '/project/CLAUDE.md': '# CLAUDE.md',
        '/project/src/index.ts': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should walk up directory tree to find root', async () => {
      setupFileSystem({
        '/workspace/project/package.json': '{}',
        '/workspace/project/src/components/Button.tsx': '',
      });

      const result = await findProjectRoot('/workspace/project/src/components');
      expect(result).toBe('/workspace/project');
    });

    it('should return starting directory if no indicators found', async () => {
      setupFileSystem({
        '/random/folder/file.txt': '',
      });

      const result = await findProjectRoot('/random/folder');
      expect(result).toBe('/random/folder');
    });

    it('should handle root directory', async () => {
      setupFileSystem({
        '/file.txt': '',
      });

      const result = await findProjectRoot('/');
      expect(result).toBe('/');
    });

    it('should detect Python projects', async () => {
      setupFileSystem({
        '/project/pyproject.toml': '',
        '/project/src/main.py': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should detect Rust projects', async () => {
      setupFileSystem({
        '/project/Cargo.toml': '',
        '/project/src/main.rs': '',
      });

      const result = await findProjectRoot('/project/src');
      expect(result).toBe('/project');
    });

    it('should detect Go projects', async () => {
      setupFileSystem({
        '/project/go.mod': '',
        '/project/main.go': '',
      });

      const result = await findProjectRoot('/project');
      expect(result).toBe('/project');
    });

    it('should handle nested monorepo structures', async () => {
      setupFileSystem({
        '/monorepo/pnpm-workspace.yaml': '',
        '/monorepo/packages/app/package.json': '{}',
        '/monorepo/packages/app/src/index.ts': '',
      });

      // Should find the package root, not monorepo root
      const result = await findProjectRoot('/monorepo/packages/app/src');
      expect(result).toBe('/monorepo/packages/app');
    });

    it('should use current working directory as default', async () => {
      const originalCwd = process.cwd;
      process.cwd = vi.fn().mockReturnValue('/current/dir');
      
      setupFileSystem({
        '/current/dir/package.json': '{}',
      });

      const result = await findProjectRoot();
      expect(result).toBe('/current/dir');
      
      process.cwd = originalCwd;
    });
  });
});