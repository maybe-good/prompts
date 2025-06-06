export const mockPromptContent = `---
name: Test Prompt
version: 1.0.0
description: A test prompt for unit testing
author: Test Author
tags:
  - test
  - mock
---

# Test Prompt

This is a test prompt for unit testing.`;

export const mockPromptContentV2 = `---
name: Test Prompt
version: 2.0.0
description: A test prompt for unit testing (updated)
author: Test Author
tags:
  - test
  - mock
  - updated
---

# Test Prompt v2

This is an updated test prompt for unit testing.`;

export const mockPromptsJson = {
  prompts: [
    {
      id: 'test-prompt',
      path: 'test/test-prompt.md',
      name: 'Test Prompt',
      description: 'A test prompt for unit testing',
      tags: ['test', 'mock'],
      author: 'Test Author',
      version: '1.0.0',
    },
    {
      id: 'another-prompt',
      path: 'another/another-prompt.md',
      name: 'Another Prompt',
      description: 'Another test prompt',
      tags: ['test', 'another'],
      author: 'Another Author',
      version: '1.0.0',
    },
  ],
};

export const mockManifest = {
  version: '1.0.0',
  prompts: [
    {
      id: 'test-prompt',
      version: '1.0.0',
      installedAt: '2024-01-01T00:00:00.000Z',
      modified: false,
    },
  ],
};

export const mockClaudeMd = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About You

@.ai/prompts/test/test-prompt.md

## About the Repository

This is a test repository.
`;