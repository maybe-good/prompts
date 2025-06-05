# create-mg-prompts

CLI tool to manage and install MG AI prompts for Claude Code and other AI assistants.

## Installation

You can use the CLI without installing it globally using `npx`:

```bash
npx create-mg-prompts
```

Or install it globally:

```bash
npm install -g create-mg-prompts
```

## Usage

### Initialize prompts in your project (default)

```bash
npx create-mg-prompts
# or just
create-mg-prompts
```

This will:
1. Detect your project root (looks for package.json, CLAUDE.md, .git, etc.)
2. Show an interactive prompt selector
3. Install selected prompts to `.ai/prompts/`
4. Update or create `CLAUDE.md` with prompt references

### Install to Claude Code global config

```bash
create-mg-prompts init --global
```

### Custom installation path

```bash
create-mg-prompts init --path custom/prompts/path
```

### List available prompts

```bash
create-mg-prompts list
```

### List installed prompts

```bash
create-mg-prompts list --installed
```

### Update prompts

```bash
create-mg-prompts update
```

Update prompts to their latest versions. Will warn if local modifications are detected.

### Force update (overwrite local changes)

```bash
create-mg-prompts update --force
```

## Options

- `-p, --path <path>` - Custom path for prompts (default: `.ai/prompts`)
- `-f, --force` - Overwrite existing prompts
- `-g, --global` - Install to Claude Code global config
- `-y, --yes` - Automatic yes to prompts (non-interactive mode)

## How it works

1. **Version tracking**: Each prompt has a version in its frontmatter. The CLI tracks installed versions in `.ai/prompts.manifest.json`

2. **Change detection**: The CLI detects if you've modified installed prompts and warns before overwriting

3. **CLAUDE.md integration**: For local installations, the CLI automatically updates your `CLAUDE.md` file with references to installed prompts

## Available Prompts

- **Max** - The Principled Engineer: An uncompromising, type-safe, performance-obsessed AI assistant

## Contributing

To add new prompts:
1. Add your prompt markdown file to `/prompts/`
2. Include frontmatter with name, version, description, author, and tags
3. Update `/prompts/prompts.json` with the new prompt metadata

## License

MIT