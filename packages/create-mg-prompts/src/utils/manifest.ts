import { readFile, writeFile } from 'fs/promises';
import { pathExists, ensureDir } from 'fs-extra';
import { dirname } from 'path';
import type { PromptManifest, InstalledPrompt } from '../types.js';

export async function loadManifest(manifestPath: string): Promise<PromptManifest | null> {
  if (!await pathExists(manifestPath)) {
    return null;
  }
  
  const content = await readFile(manifestPath, 'utf-8');
  return JSON.parse(content) as PromptManifest;
}

export async function saveManifest(
  manifestPath: string,
  manifest: PromptManifest
): Promise<void> {
  await ensureDir(dirname(manifestPath));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export async function checkFileModified(
  filePath: string,
  originalContent: string
): Promise<boolean> {
  if (!await pathExists(filePath)) {
    return true; // File deleted counts as modified
  }
  
  const currentContent = await readFile(filePath, 'utf-8');
  return currentContent !== originalContent;
}