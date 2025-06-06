import { vi } from 'vitest';
import { vol, fs as memfs } from 'memfs';
import { dirname } from 'path';

// Store original fs methods
const originalFs = {
  promises: {
    readFile: () => {},
    writeFile: () => {},
    mkdir: () => {},
    access: () => {},
  },
};

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: async (path: string, encoding?: string) => {
    return memfs.promises.readFile(path, encoding);
  },
  writeFile: async (path: string, data: string | Buffer) => {
    const dir = dirname(path);
    await memfs.promises.mkdir(dir, { recursive: true });
    return memfs.promises.writeFile(path, data);
  },
  mkdir: async (path: string, options?: any) => {
    return memfs.promises.mkdir(path, options);
  },
  access: async (path: string) => {
    return memfs.promises.access(path);
  },
}));

// Mock fs-extra with memfs
vi.mock('fs-extra', () => ({
  pathExists: async (path: string) => {
    try {
      await memfs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  },
  ensureDir: async (path: string) => {
    await memfs.promises.mkdir(path, { recursive: true });
  },
  copy: async (src: string, dest: string) => {
    const content = await memfs.promises.readFile(src);
    const destDir = dirname(dest);
    await memfs.promises.mkdir(destDir, { recursive: true });
    await memfs.promises.writeFile(dest, content);
  },
  readFile: async (path: string, encoding?: string) => {
    return memfs.promises.readFile(path, encoding);
  },
  writeFile: async (path: string, data: string | Buffer) => {
    const dir = dirname(path);
    await memfs.promises.mkdir(dir, { recursive: true });
    return memfs.promises.writeFile(path, data);
  },
  readJSON: async (path: string) => {
    const content = await memfs.promises.readFile(path, 'utf-8');
    return JSON.parse(content);
  },
  writeJSON: async (path: string, data: any) => {
    const dir = dirname(path);
    await memfs.promises.mkdir(dir, { recursive: true });
    await memfs.promises.writeFile(path, JSON.stringify(data, null, 2));
  },
}));

// Helper to reset filesystem
export function resetFileSystem() {
  vol.reset();
}

// Helper to setup test filesystem
export function setupFileSystem(files: Record<string, string | Buffer>) {
  vol.fromJSON(files);
}

// Mock inquirer for non-interactive tests
export function mockInquirer(answers: Record<string, any>) {
  const inquirerMock = {
    prompt: vi.fn().mockResolvedValue(answers),
  };
  
  vi.doMock('inquirer', () => ({
    default: inquirerMock,
  }));
  
  return inquirerMock;
}

// Mock ora spinner
export function mockOra() {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  };
  
  vi.doMock('ora', () => ({
    default: () => spinner,
  }));
  
  return spinner;
}

// Mock chalk for consistent output
vi.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    bold: (str: string) => str,
  },
}));

// Export memfs for direct access in tests
export { vol, memfs };