import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { 
  setupTestEnvironment, 
  cleanupTestEnvironment,
  setupTestPrompts,
  setupProjectStructure,
} from '../helpers/test-setup.js';
import { loadAvailablePrompts } from '../../utils/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Debug tests', () => {
  it('should show where prompts are expected', async () => {
    const context = setupTestEnvironment();
    
    try {
      // Show where we are
      console.log('Test __dirname:', __dirname);
      console.log('Context tempDir:', context.tempDir);
      console.log('Context projectRoot:', context.projectRoot);
      console.log('Current working directory:', process.cwd());
      
      // Show where prompts.ts will look
      const utilsDir = join(__dirname, '../../utils');
      const promptsDir = join(utilsDir, '../prompts');
      console.log('Expected prompts directory:', promptsDir);
      
      // Set up prompts
      setupTestPrompts(context);
      
      // Check if prompts.json exists
      const promptsJsonPath = join(promptsDir, 'prompts.json');
      console.log('prompts.json exists:', existsSync(promptsJsonPath));
      
      // Try to load prompts
      try {
        const prompts = await loadAvailablePrompts();
        console.log('Loaded prompts:', prompts.length);
      } catch (error) {
        console.error('Error loading prompts:', error);
      }
    } finally {
      cleanupTestEnvironment(context);
    }
  });
});