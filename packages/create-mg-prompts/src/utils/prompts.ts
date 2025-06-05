import { readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { Prompt, PromptMetadata } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadAvailablePrompts(): Promise<Prompt[]> {
  const promptsPath = join(__dirname, 'prompts/prompts.json');
  const promptsData = JSON.parse(await readFile(promptsPath, 'utf-8'));
  
  const prompts: Prompt[] = [];
  
  for (const promptInfo of promptsData.prompts) {
    const promptPath = join(__dirname, 'prompts', promptInfo.path);
    const content = await readFile(promptPath, 'utf-8');
    const { data } = matter(content);
    
    prompts.push({
      id: promptInfo.id,
      path: promptInfo.path,
      metadata: data as PromptMetadata
    });
  }
  
  return prompts;
}

export async function getPromptContent(promptPath: string): Promise<string> {
  const fullPath = join(__dirname, 'prompts', promptPath);
  return readFile(fullPath, 'utf-8');
}