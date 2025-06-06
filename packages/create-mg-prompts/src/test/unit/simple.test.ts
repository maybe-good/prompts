import { describe, it, expect, beforeEach } from 'vitest';
import { pathExists } from 'fs-extra';
import { writeFile, readFile } from 'fs/promises';
import { resetFileSystem, setupFileSystem } from '../setup.js';

describe('simple filesystem test', () => {
  beforeEach(() => {
    resetFileSystem();
  });

  it('should create and read files with mock filesystem', async () => {
    await writeFile('/test.txt', 'Hello World');
    const content = await readFile('/test.txt', 'utf-8');
    expect(content).toBe('Hello World');
  });

  it('should check file existence', async () => {
    setupFileSystem({
      '/exists.txt': 'I exist',
    });
    
    const exists = await pathExists('/exists.txt');
    const notExists = await pathExists('/not-exists.txt');
    
    expect(exists).toBe(true);
    expect(notExists).toBe(false);
  });
});