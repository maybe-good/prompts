# Test Suite for create-mg-prompts

## Overview

This test suite provides comprehensive coverage for the create-mg-prompts CLI tool using Vitest.

## Structure

```
test/
├── fixtures/        # Test data and mock objects
├── unit/           # Unit tests for individual utilities
├── integration/    # Integration tests for commands
├── setup.ts        # Test setup and mocks
└── README.md       # This file
```

## Test Approach

### Unit Tests

Unit tests focus on individual utility functions in isolation:

- **paths.test.ts** - Tests for path detection utilities
- **project.test.ts** - Tests for project root finding
- **manifest.test.ts** - Tests for version manifest operations
- **claude-md.test.ts** - Tests for CLAUDE.md file operations
- **prompts.test.ts** - Tests for prompt loading and parsing

### Integration Tests

Integration tests verify complete command workflows:

- **init.test.ts** - Tests the full initialization flow
- **update.test.ts** - Tests prompt updating functionality
- **list.test.ts** - Tests listing prompts

## Mocking Strategy

We use `memfs` to mock the filesystem, allowing tests to run without touching the real filesystem. This provides:

1. **Isolation** - Tests don't affect the real filesystem
2. **Speed** - Memory operations are faster than disk
3. **Consistency** - Tests start with a clean state
4. **Cross-platform** - No OS-specific path issues

### Key Mocks

- **fs/promises** - Redirected to memfs
- **fs-extra** - Custom implementation using memfs
- **inquirer** - Mocked for non-interactive testing
- **ora** - Mocked spinner for clean test output
- **chalk** - Simplified to remove color codes

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '../../utils/module.js';
import { resetFileSystem, setupFileSystem } from '../setup.js';

describe('module name', () => {
  beforeEach(() => {
    resetFileSystem();
  });

  it('should do something', async () => {
    setupFileSystem({
      '/test/file.txt': 'content',
    });

    const result = await functionToTest('/test/file.txt');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { command } from '../../commands/command.js';
import { resetFileSystem, setupFileSystem, mockInquirer, mockOra } from '../setup.js';

describe('command integration', () => {
  beforeEach(() => {
    resetFileSystem();
    vi.clearAllMocks();
  });

  it('should execute command successfully', async () => {
    setupFileSystem({
      '/project/package.json': '{}',
    });

    mockInquirer({ answer: 'value' });
    mockOra();

    await command({ option: true });

    // Verify results
  });
});
```

## Known Issues & Limitations

1. **Path Resolution** - The bundled prompts path resolution in tests needs careful setup
2. **Process.exit** - Commands that call process.exit need special handling
3. **Async Mocks** - Some async operations need explicit promise resolution

## Future Improvements

1. Add E2E tests that run the actual CLI binary
2. Add performance benchmarks
3. Add mutation testing
4. Improve mock filesystem to handle more edge cases
5. Add visual regression tests for CLI output