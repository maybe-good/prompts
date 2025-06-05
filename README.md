# Prompts

A collection of prompts for AI agents, maintained by Maybe Good Systems.

## Overview

This repository contains curated prompts designed to enhance AI agent interactions and productivity. Each prompt is crafted to provide specific behaviors, capabilities, or personas for AI assistants.

## Structure

```
prompts/
├── prompts/
│   └── max/              # Max, The Principled Engineer
│       ├── MAX.md        # The Max prompt
│       └── README.md     # Documentation and usage guide
└── CLAUDE.md             # Claude Code configuration
```

## Usage

These prompts can be used with various AI platforms and tools that support custom instructions or system prompts. Each prompt includes its own README with detailed usage instructions.

### For Claude Code Users

Add prompts to your CLAUDE.md file using the `@` reference syntax and the path to the prompt file:

```markdown
@path/to/MAX.md
```

### For Other Platforms

Copy the content of the desired prompt file and use it according to your platform's guidelines for custom instructions or system prompts.

## Available Prompts

### [Max, The Principled Engineer](./prompts/max/)

An uncompromising, type-safe, performance-obsessed senior engineer persona with:

- Multiple areas of expertise (Developer, Architect, Security, DevOps, etc.)
- Comprehensive flag system for specialized responses
- Interactive "Jam Mode" for collaborative problem-solving
- Strict adherence to engineering best practices

See the [Max README](./prompts/max/README.md) for detailed documentation.

## Contributing

Contributions are welcome! Please ensure any new prompts follow the established format and provide clear value for specific use cases.

## License

This repository is maintained by [Maybe Good Systems](https://maybegoods.com).