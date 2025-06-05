# create-mg-prompts Architecture

## Overview

`create-mg-prompts` is a TypeScript CLI tool designed to manage AI prompts for Claude Code and other AI assistants. It follows a modular architecture with clear separation of concerns.

## Project Structure

```
create-mg-prompts/
├── src/
│   ├── index.ts           # CLI entry point and command definitions
│   ├── types.ts           # TypeScript interfaces and types
│   ├── commands/          # Command implementations
│   │   ├── init.ts        # Initialize/install prompts
│   │   ├── list.ts        # List available/installed prompts
│   │   └── update.ts      # Update installed prompts
│   └── utils/             # Utility functions
│       ├── package.ts     # Package.json utilities
│       ├── paths.ts       # Path detection and management
│       ├── prompts.ts     # Prompt loading and parsing
│       ├── project.ts     # Project root detection
│       ├── manifest.ts    # Version tracking manifest
│       └── claude-md.ts   # CLAUDE.md file management
├── dist/                  # Built output
│   ├── index.js          # Compiled CLI
│   └── prompts/          # Bundled prompt files
└── docs/                 # Documentation
```

## Key Components

### 1. CLI Entry Point (`src/index.ts`)

- Uses Commander.js for CLI argument parsing
- Defines available commands: `init`, `list`, `update`
- Default action runs `init` for better UX
- Handles global flags like `--version` and `--help`

### 2. Command Implementations

#### `init` Command (`commands/init.ts`)
- **Purpose**: Install prompts to a project or globally
- **Flow**:
  1. Detect installation mode (local vs global)
  2. Find project root or Claude Code config path
  3. Load available prompts with metadata
  4. Interactive selection (or install all with `-y`)
  5. Check for conflicts and handle overwrites
  6. Copy prompt files to destination
  7. Update manifest with version tracking
  8. Update CLAUDE.md with prompt references

#### `list` Command (`commands/list.ts`)
- **Purpose**: Show available or installed prompts
- **Modes**:
  - Default: List all available prompts from bundle
  - `--installed`: Show prompts in current project

#### `update` Command (`commands/update.ts`)
- **Purpose**: Update installed prompts to latest versions
- **Features**:
  - Detects local modifications
  - Warns before overwriting changes
  - `--force` flag to override safety checks

### 3. Utility Modules

#### Path Detection (`utils/paths.ts`)
- Detects Claude Code installation across platforms:
  - macOS: `~/Library/Application Support/Claude`
  - Windows: `%APPDATA%/Claude`
  - Linux: `$XDG_CONFIG_HOME/claude`
- Provides default paths for prompts and manifest

#### Project Detection (`utils/project.ts`)
- Finds project root by looking for indicators:
  - `package.json`, `CLAUDE.md`, `.git`
  - Language-specific files (`pyproject.toml`, `Cargo.toml`, etc.)
- Walks up directory tree until found

#### Prompt Management (`utils/prompts.ts`)
- Loads prompts from bundled `dist/prompts/`
- Parses frontmatter using `gray-matter`
- Provides prompt content retrieval

#### Version Tracking (`utils/manifest.ts`)
- Manifest schema:
  ```json
  {
    "version": "1.0.0",
    "prompts": [{
      "id": "max",
      "version": "1.0.0",
      "installedAt": "2025-06-05T21:17:40.492Z",
      "modified": false
    }]
  }
  ```
- Tracks installed versions and modification status
- Enables safe updates with change detection

#### CLAUDE.md Integration (`utils/claude-md.ts`)
- Updates or creates CLAUDE.md files
- Manages "About You" section with prompt references
- Preserves existing content while updating references
- Uses relative paths for portability

## Data Flow

### Installation Flow

```mermaid
flowchart TD
    A[User runs: npx create-mg-prompts] --> B{Global flag?}
    B -->|Yes| C[Detect Claude Code Path]
    B -->|No| D[Find Project Root]
    
    C --> E[Load Available Prompts]
    D --> E
    
    E --> F{Interactive mode?}
    F -->|Yes| G[Show Prompt Selection UI]
    F -->|No -y flag| H[Select All Prompts]
    
    G --> I[User Selects Prompts]
    H --> I
    I --> J{Existing Files?}
    
    J -->|Yes| K{Force flag?}
    J -->|No| O[Copy Files]
    
    K -->|Yes| O[Copy Files]
    K -->|No| L{User Confirms?}
    
    L -->|Yes| O[Copy Files]
    L -->|No| M[Cancel Installation]
    
    O --> P[Update Manifest]
    P --> Q{Local Install?}
    
    Q -->|Yes| R{CLAUDE.md exists?}
    Q -->|No| S[Success]
    
    R -->|Yes| T[Update CLAUDE.md]
    R -->|No| U{Create CLAUDE.md?}
    
    U -->|Yes| T[Update CLAUDE.md]
    U -->|No| S[Success]
    
    T --> S[Success]
    M --> V[Exit]
    
    style A fill:#e1f5e1
    style S fill:#d4f4dd
    style V fill:#ffd4d4
    style G fill:#fff4d4
```

### Update Flow

```mermaid
flowchart TD
    A[User runs: create-mg-prompts update] --> B[Load Manifest]
    B --> C{Manifest exists?}
    
    C -->|No| D[No prompts installed]
    C -->|Yes| E[Load Installed Prompts]
    
    E --> F[Load Available Prompts]
    F --> G[Compare Versions]
    
    G --> H{Updates Available?}
    H -->|No| I[All up to date]
    H -->|Yes| J[Check File Modifications]
    
    J --> K[Show Update Summary]
    K --> L{Modified Files?}
    
    L -->|No| M[Apply All Updates]
    L -->|Yes| N{Force flag?}
    
    N -->|Yes| M[Apply All Updates]
    N -->|No| O{User Confirms?}
    
    O -->|Yes| P[Skip Modified Files]
    O -->|No| Q[Cancel Update]
    
    P --> R[Apply Safe Updates]
    M --> S[Update All Files]
    
    R --> T[Update Manifest]
    S --> T[Update Manifest]
    
    T --> U[Success with Summary]
    Q --> V[Exit]
    D --> V[Exit]
    I --> V[Exit]
    
    style A fill:#e1f5e1
    style U fill:#d4f4dd
    style V fill:#ffd4d4
    style K fill:#fff4d4
```

### Component Interaction

```mermaid
graph TB
    subgraph "CLI Layer"
        CLI[index.ts<br/>Commander.js]
    end
    
    subgraph "Commands"
        Init[init.ts]
        List[list.ts]
        Update[update.ts]
    end
    
    subgraph "Utils"
        Paths[paths.ts<br/>Path Detection]
        Project[project.ts<br/>Root Finding]
        Prompts[prompts.ts<br/>Loading]
        Manifest[manifest.ts<br/>Versioning]
        ClaudeMD[claude-md.ts<br/>Integration]
    end
    
    subgraph "Data"
        Bundle[Bundled Prompts<br/>dist/prompts/]
        ManifestFile[.ai/prompts.manifest.json]
        ClaudeFile[CLAUDE.md]
        PromptFiles[.ai/prompts/*.md]
    end
    
    CLI --> Init
    CLI --> List
    CLI --> Update
    
    Init --> Paths
    Init --> Project
    Init --> Prompts
    Init --> Manifest
    Init --> ClaudeMD
    
    Update --> Manifest
    Update --> Prompts
    Update --> Project
    
    List --> Prompts
    List --> Manifest
    List --> Project
    
    Prompts --> Bundle
    Manifest --> ManifestFile
    ClaudeMD --> ClaudeFile
    Init --> PromptFiles
    Update --> PromptFiles
    
    style CLI fill:#e1f5e1
    style Bundle fill:#fff4d4
    style ManifestFile fill:#d4f4dd
    style ClaudeFile fill:#d4f4dd
    style PromptFiles fill:#d4f4dd
```

## Design Decisions

### 1. Bundled Prompts
- **Decision**: Bundle prompts in npm package during build
- **Rationale**: 
  - Works offline
  - Versioned with CLI tool
  - Simple deployment
  - No external dependencies
- **Trade-off**: Requires npm release for prompt updates

### 2. Monorepo Structure
- **Decision**: CLI and prompts in same repository
- **Rationale**:
  - Easier development and testing
  - Atomic updates
  - Shared versioning with changesets
- **Trade-off**: Larger repository size

### 3. TypeScript + ESM
- **Decision**: Pure ESM modules with TypeScript
- **Rationale**:
  - Modern JavaScript standards
  - Better tree-shaking
  - Type safety
- **Trade-off**: Requires Node.js 18+

### 4. Version Tracking
- **Decision**: Local manifest file for version tracking
- **Rationale**:
  - Enables update detection
  - Tracks modifications
  - No external state needed
- **Trade-off**: Another file in user's project

### 5. Interactive by Default
- **Decision**: Interactive prompts with `-y` flag for automation
- **Rationale**:
  - Better user experience
  - Prevents accidental overwrites
  - Familiar pattern from npm/yarn
- **Trade-off**: Requires TTY for default usage

## Extension Points

### Adding New Prompts
1. Add prompt file to `/prompts/` directory
2. Include frontmatter with metadata:
   ```yaml
   ---
   name: PromptName
   version: 1.0.0
   description: Brief description
   author: Your Name
   tags: [tag1, tag2]
   ---
   ```
3. Update `/prompts/prompts.json` registry
4. Build and publish new version

### Adding New Commands
1. Create new file in `src/commands/`
2. Implement command logic
3. Register in `src/index.ts`
4. Add types to `src/types.ts` if needed

### Platform Support
- Path detection in `utils/paths.ts` can be extended
- Add new platform-specific paths to `possiblePaths` array

## Security Considerations

1. **File System Access**: Only writes to user-specified directories
2. **No Network Calls**: Everything bundled, no external requests
3. **Path Validation**: Uses `path.join` to prevent directory traversal
4. **Modification Detection**: Warns before overwriting user changes

## Future Enhancements

1. **Remote Prompt Registry**: Fetch latest prompts from API
2. **Prompt Templates**: Support for prompt parameters/customization
3. **Diff Viewer**: Show what changed between versions
4. **Rollback**: Restore previous prompt versions
5. **Custom Prompt Sources**: Support git repos or URLs
6. **Prompt Testing**: Validate prompt syntax and structure
7. **Global Config**: User preferences for default behavior

## Dependencies

### Runtime
- `commander`: CLI framework
- `chalk`: Terminal colors
- `inquirer`: Interactive prompts
- `ora`: Spinner for long operations
- `fs-extra`: Enhanced file system operations
- `gray-matter`: Frontmatter parsing

### Development
- `typescript`: Type safety
- `tsup`: Fast TypeScript bundler
- `@changesets/cli`: Version management
- `vitest`: Testing framework (ready for tests)
- `eslint`: Code linting

## Performance Considerations

1. **Startup Time**: Minimal dependencies for fast CLI startup
2. **Bundle Size**: ~18KB minified JavaScript
3. **File Operations**: Async I/O throughout
4. **Memory Usage**: Streams for large file operations

## Testing Strategy

The project is set up for testing with Vitest but tests are not yet implemented. Future test coverage should include:

1. **Unit Tests**: Utility functions and parsers
2. **Integration Tests**: Command workflows
3. **E2E Tests**: Full CLI operations
4. **Cross-Platform**: Path detection on different OS