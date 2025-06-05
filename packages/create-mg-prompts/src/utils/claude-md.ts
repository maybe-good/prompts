import { readFile, writeFile } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { join } from 'path';

const CLAUDE_MD_HEADER = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`;

const PROMPT_SECTION_START = '## About You\n\n';
const PROMPT_SECTION_END = '\n## ';

export async function updateClaudeMd(
  projectRoot: string,
  promptPaths: Map<string, string>
): Promise<void> {
  const claudeMdPath = join(projectRoot, 'CLAUDE.md');
  
  let content = '';
  
  // Read existing CLAUDE.md if it exists
  if (await pathExists(claudeMdPath)) {
    content = await readFile(claudeMdPath, 'utf-8');
  } else {
    content = CLAUDE_MD_HEADER;
  }
  
  // Find or create the "About You" section
  const aboutYouIndex = content.indexOf(PROMPT_SECTION_START);
  
  if (aboutYouIndex === -1) {
    // Add the section if it doesn't exist
    content += '\n' + PROMPT_SECTION_START;
  }
  
  // Build the new prompt references
  const promptReferences = Array.from(promptPaths.entries())
    .map(([id, path]) => `@${path}`)
    .join('\n');
  
  if (aboutYouIndex !== -1) {
    // Replace existing content in "About You" section
    const sectionStart = aboutYouIndex + PROMPT_SECTION_START.length;
    let sectionEnd = content.indexOf(PROMPT_SECTION_END, sectionStart);
    
    if (sectionEnd === -1) {
      sectionEnd = content.length;
    }
    
    content = 
      content.slice(0, sectionStart) +
      promptReferences +
      '\n' +
      content.slice(sectionEnd);
  } else {
    // Append to the new section
    content += promptReferences + '\n';
  }
  
  await writeFile(claudeMdPath, content, 'utf-8');
}

export async function getClaudeMdPrompts(projectRoot: string): Promise<string[]> {
  const claudeMdPath = join(projectRoot, 'CLAUDE.md');
  
  if (!await pathExists(claudeMdPath)) {
    return [];
  }
  
  const content = await readFile(claudeMdPath, 'utf-8');
  
  // Extract prompt references
  const promptRegex = /@\.\/(.+\.md)/g;
  const matches = [...content.matchAll(promptRegex)];
  
  return matches.map(match => match[1]);
}