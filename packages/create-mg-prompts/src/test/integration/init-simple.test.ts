import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetFileSystem, setupFileSystem } from '../setup.js';
import { mockPromptContent, mockPromptsJson } from '../fixtures/prompts.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock modules before imports
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    text: '',
  })
}));

// Import after mocks
import inquirer from 'inquirer';
import { init } from '../../commands/init.js';

describe('init command - simple test', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
    
    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue('/project');
    
    // The prompts.ts file resolves __dirname to src/utils
    // So prompts should be at src/prompts (one level up from utils)
    const utilsDir = join(__dirname, '../../utils');
    const promptsDir = join(utilsDir, '../prompts');
    
    // Setup basic project structure
    setupFileSystem({
      '/project/package.json': '{}',
      [join(promptsDir, 'prompts.json')]: JSON.stringify(mockPromptsJson),
      [join(promptsDir, 'test/test-prompt.md')]: mockPromptContent,
      [join(promptsDir, 'another/another-prompt.md')]: mockPromptContent,
    });
  });

  it('should install prompts with --yes flag', async () => {
    await init({ yes: true });

    // Check manifest was created
    const manifest = JSON.parse(await readFile('/project/.ai/prompts.manifest.json', 'utf-8'));
    expect(manifest.prompts).toHaveLength(2);
    expect(manifest.prompts[0].id).toBe('test-prompt');
    expect(manifest.prompts[0].version).toBe('1.0.0');

    // Check prompt was copied
    const promptContent = await readFile('/project/.ai/prompts/test/test-prompt.md', 'utf-8');
    expect(promptContent).toBe(mockPromptContent);

    // Check CLAUDE.md was updated
    const claudeMd = await readFile('/project/CLAUDE.md', 'utf-8');
    expect(claudeMd).toContain('@.ai/prompts/test/test-prompt.md');
  });

  it('should install selected prompts interactively', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({
      promptIds: ['test-prompt']
    });

    await init({});

    // Check only selected prompt was installed
    const manifest = JSON.parse(await readFile('/project/.ai/prompts.manifest.json', 'utf-8'));
    expect(manifest.prompts).toHaveLength(1);
    expect(manifest.prompts[0].id).toBe('test-prompt');
  });
});