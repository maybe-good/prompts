# Contributing to create-mg-prompts

## How to Contribute

We welcome contributions! Here's how you can help:

### Adding New Prompts

1. **Create your prompt file**
   ```bash
   # Add your prompt to the prompts directory
   prompts/your-prompt-name/YOUR_PROMPT.md
   ```

2. **Add frontmatter metadata**
   ```yaml
   ---
   name: Your Prompt Name
   version: 1.0.0
   description: A brief description of what your prompt does
   author: Your Name
   tags:
     - relevant
     - tags
     - here
   ---
   ```

3. **Update the prompt registry**
   ```json
   // In prompts/prompts.json, add:
   {
     "id": "your-prompt-id",
     "path": "your-prompt-name/YOUR_PROMPT.md",
     "name": "Your Prompt Name",
     "description": "...",
     "tags": ["..."],
     "author": "Your Name",
     "version": "1.0.0"
   }
   ```

4. **Test locally**
   ```bash
   cd packages/create-mg-prompts
   pnpm build
   node dist/index.js list
   ```

### Prompt Guidelines

- **Clear Identity**: Define who/what the AI assistant is
- **Specific Instructions**: Be explicit about behavior
- **Examples**: Include examples of good responses
- **Version Appropriately**: Use semantic versioning
- **Test Thoroughly**: Ensure the prompt works as intended

### Code Contributions

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/prompts.git
   cd prompts
   pnpm install
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and test**
   ```bash
   cd packages/create-mg-prompts
   pnpm dev  # Watch mode
   pnpm build  # Build
   pnpm typecheck  # Type checking
   ```

4. **Create a changeset**
   ```bash
   pnpm changeset
   # Follow prompts to describe your changes
   ```

5. **Submit PR**
   - Clear description of changes
   - Link any related issues
   - Ensure CI passes

### Development Setup

```bash
# Install dependencies
pnpm install

# Build the CLI
cd packages/create-mg-prompts
pnpm build

# Test locally
cd test-project
node ../packages/create-mg-prompts/dist/index.js

# Run in watch mode for development
pnpm dev
```

### Code Style

- TypeScript with strict mode
- ESM modules only
- Functional style preferred
- Clear variable names
- Comments for complex logic

### Testing

Currently, we're setting up the test suite. When contributing:
- Add tests for new features
- Ensure existing tests pass
- Test cross-platform compatibility

### Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

### Questions?

- Open an issue for discussion
- Check existing issues first
- Be respectful and constructive

## Release Process

Releases are managed by maintainers using changesets:

1. Contributors create changesets with their PRs
2. Changesets are accumulated
3. Maintainers run `pnpm changeset version`
4. Publish to npm with `pnpm release`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.