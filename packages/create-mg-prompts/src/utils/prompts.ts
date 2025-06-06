import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Prompt, PromptMetadata } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine if we're running from built code or source
const isBuilt = __dirname.endsWith('/dist') || __dirname.includes('/dist/');
const promptsBaseDir = isBuilt ? join(__dirname, 'prompts') : join(__dirname, '../prompts');

export async function loadAvailablePrompts(): Promise<Prompt[]> {
  const promptsPath = join(promptsBaseDir, 'prompts.json');
  const promptsData = JSON.parse(await readFile(promptsPath, 'utf-8'));
  
  const prompts: Prompt[] = [];
  
  for (const promptInfo of promptsData.prompts) {
    const promptPath = join(promptsBaseDir, promptInfo.path);
    try {
      const content = await readFile(promptPath, 'utf-8');
      const { data } = matter(content);
      
      prompts.push({
        id: promptInfo.id,
        path: promptInfo.path,
        metadata: data as PromptMetadata
      });
    } catch (error) {
      // Skip prompts that can't be loaded
      console.warn(`Warning: Could not load prompt ${promptInfo.id} from ${promptInfo.path}`);
    }
  }
  
  return prompts;
}

export async function getPromptContent(promptPath: string): Promise<string> {
  const fullPath = join(promptsBaseDir, promptPath);
  return readFile(fullPath, 'utf-8');
}