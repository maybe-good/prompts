import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('init command - E2E tests', () => {
  let tempDir: string;
  let originalCwd: string;
  const cliPath = join(process.cwd(), 'dist/index.js');

  beforeEach(() => {
    // Create temp directory
    tempDir = mkdtempSync(join(tmpdir(), 'mg-prompts-e2e-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Create a basic package.json
    execSync('npm init -y', { stdio: 'pipe' });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should install all prompts with --yes flag', () => {
    // Run the CLI
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });

    // Check results
    expect(existsSync('.ai/prompts.manifest.json')).toBe(true);
    expect(existsSync('.ai/prompts/max/MAX.md')).toBe(true);
    expect(existsSync('CLAUDE.md')).toBe(true);
    
    const manifest = JSON.parse(readFileSync('.ai/prompts.manifest.json', 'utf-8'));
    expect(manifest.prompts).toHaveLength(1);
    expect(manifest.prompts[0].id).toBe('max');
    
    const claudeMd = readFileSync('CLAUDE.md', 'utf-8');
    expect(claudeMd).toContain('@.ai/prompts/max/MAX.md');
  });

  it('should handle custom installation path', () => {
    execSync(`node ${cliPath} init --yes --path custom/prompts`, { stdio: 'pipe' });

    expect(existsSync('custom/prompts/max/MAX.md')).toBe(true);
    expect(existsSync('.ai/prompts/max/MAX.md')).toBe(false);
    
    const claudeMd = readFileSync('CLAUDE.md', 'utf-8');
    expect(claudeMd).toContain('@custom/prompts/max/MAX.md');
  });

  it('should skip existing files without --force', () => {
    // First installation
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });
    
    // Modify a file
    execSync('echo "Modified content" > .ai/prompts/max/MAX.md');
    
    // Second installation without force
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });
    
    // Check file was not overwritten
    const content = readFileSync('.ai/prompts/max/MAX.md', 'utf-8').trim();
    expect(content).toBe('Modified content');
  });

  it('should overwrite with --force', () => {
    // First installation
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });
    
    // Modify a file
    execSync('echo "Modified content" > .ai/prompts/max/MAX.md');
    
    // Second installation with force
    execSync(`node ${cliPath} init --yes --force`, { stdio: 'pipe' });
    
    // Check file was overwritten
    const content = readFileSync('.ai/prompts/max/MAX.md', 'utf-8');
    expect(content).toContain('# Max, The Principled Engineer');
  });

  it('should list installed prompts', () => {
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });
    
    const output = execSync(`node ${cliPath} list`, { encoding: 'utf-8' });
    expect(output).toContain('Max');
    expect(output).toContain('1.0.0');
    // The list command shows prompts available, not installed ones
    expect(output).toContain('Available Prompts');
  });

  it('should handle update command', () => {
    // Install first
    execSync(`node ${cliPath} init --yes`, { stdio: 'pipe' });
    
    // Update - the update command doesn't have --yes flag
    const output = execSync(`node ${cliPath} update`, { encoding: 'utf-8' });
    expect(output).toContain('All prompts are up to date');
  });
});