import { homedir, platform } from 'os';
import { join } from 'path';
import { pathExists } from 'fs-extra';

export async function detectClaudeCodePath(): Promise<string | null> {
  const home = homedir();
  const os = platform();
  
  const possiblePaths = [];
  
  if (os === 'darwin') {
    // macOS paths
    possiblePaths.push(
      join(home, 'Library', 'Application Support', 'Claude'),
      join(home, 'Library', 'Application Support', 'com.anthropic.claude'),
      join(home, '.claude'),
      join(home, '.config', 'claude')
    );
  } else if (os === 'win32') {
    // Windows paths
    possiblePaths.push(
      join(home, 'AppData', 'Roaming', 'Claude'),
      join(home, 'AppData', 'Roaming', 'com.anthropic.claude'),
      join(home, '.claude'),
      join(home, '.config', 'claude')
    );
  } else {
    // Linux/Unix paths (XDG standard)
    const xdgConfig = process.env.XDG_CONFIG_HOME || join(home, '.config');
    possiblePaths.push(
      join(xdgConfig, 'claude'),
      join(xdgConfig, 'com.anthropic.claude'),
      join(home, '.claude')
    );
  }
  
  // Check each path
  for (const path of possiblePaths) {
    if (await pathExists(path)) {
      return path;
    }
  }
  
  return null;
}

export function getDefaultPromptsPath(): string {
  return '.ai/prompts';
}

export function getManifestPath(projectRoot: string): string {
  return join(projectRoot, '.ai', 'prompts.manifest.json');
}