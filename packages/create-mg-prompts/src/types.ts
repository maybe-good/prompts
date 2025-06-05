export interface PromptMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
}

export interface Prompt {
  id: string;
  path: string;
  metadata: PromptMetadata;
}

export interface InstalledPrompt {
  id: string;
  version: string;
  installedAt: string;
  modified: boolean;
}

export interface PromptManifest {
  version: string;
  prompts: InstalledPrompt[];
}

export interface ClaudeCodeConfig {
  promptsPath?: string;
  claudeMdPath?: string;
}