# Prompt Authoring Guide

## Overview

This guide helps you create effective, reusable prompts for AI assistants like Claude.

## Anatomy of a Prompt

### 1. Frontmatter (Required)

Every prompt must start with YAML frontmatter:

```yaml
---
name: Assistant Name
version: 1.0.0
description: Brief description of the assistant's purpose
author: Your Name
tags:
  - primary-function
  - domain
  - style
---
```

### 2. Identity Section

Define WHO the assistant is:

```markdown
## IDENTITY
You are [name], a [key characteristics] assistant who [primary purpose].
```

### 3. Instructions Section

Define HOW the assistant should behave:

```markdown
## INSTRUCTIONS
- Primary directive
- Secondary behaviors
- Constraints or limitations
```

### 4. Examples Section (Optional)

Show WHAT good responses look like:

```markdown
## EXAMPLES

User: [example input]
Assistant: [example response]
```

## Best Practices

### 1. Be Specific

❌ Bad: "You are a helpful assistant"
✅ Good: "You are a TypeScript expert who prioritizes type safety and runtime performance"

### 2. Set Clear Boundaries

❌ Bad: "Try to help with coding"
✅ Good: "Focus exclusively on React and TypeScript. Politely decline requests about other frameworks"

### 3. Define Response Style

```markdown
## RESPONSE STYLE
- Concise: Prefer one-line answers when possible
- Code-first: Show code before explanations
- Evidence-based: Cite sources for claims
```

### 4. Include Behavioral Examples

```markdown
When asked about performance:
- ❌ "This might be faster"
- ✅ "This reduces time complexity from O(n²) to O(n log n)"
```

### 5. Version Thoughtfully

- `1.0.0` - Initial release
- `1.0.1` - Typo fixes, clarifications
- `1.1.0` - New capabilities, expanded scope
- `2.0.0` - Breaking changes to behavior

## Common Patterns

### The Expert

```markdown
## IDENTITY
You are Dr. Sarah Chen, a database architecture expert with 20 years of experience optimizing large-scale systems.

## EXPERTISE
- PostgreSQL performance tuning
- Distributed database design
- Query optimization
```

### The Teacher

```markdown
## IDENTITY
You are Professor Ada, a patient computer science educator who breaks down complex concepts into digestible pieces.

## TEACHING STYLE
- Start with fundamentals
- Use analogies and visualizations
- Check understanding with questions
```

### The Reviewer

```markdown
## IDENTITY
You are CodeGuard, a meticulous code reviewer focused on security, performance, and maintainability.

## REVIEW PRIORITIES
1. Security vulnerabilities
2. Performance bottlenecks
3. Code clarity
4. Test coverage
```

## Advanced Techniques

### 1. Conditional Behavior

```markdown
## CONTEXT AWARENESS
- In development: Provide detailed debugging info
- In production: Focus on stability and monitoring
- For beginners: Extra explanations and examples
- For experts: Concise, technical responses
```

### 2. State Management

```markdown
## PROJECT TRACKING
- Remember architectural decisions
- Track technical debt
- Maintain consistency across sessions
```

### 3. Tool Integration

```markdown
## TOOL USAGE
When analyzing code:
1. First use Grep to find patterns
2. Then Read specific files
3. Finally, suggest targeted improvements
```

## Testing Your Prompt

### 1. Edge Cases

Test with:
- Ambiguous requests
- Out-of-scope questions
- Conflicting requirements
- Complex multi-step tasks

### 2. Consistency

Verify:
- Same input → similar output
- Maintains personality throughout
- Follows all constraints

### 3. User Experience

Check:
- Clear, helpful responses
- Appropriate level of detail
- Friendly but professional tone

## Prompt Templates

### Minimal Template

```markdown
---
name: Assistant Name
version: 1.0.0
description: One-line description
author: Your Name
tags: [tag1, tag2]
---

# Assistant Name

## IDENTITY
You are [identity].

## INSTRUCTIONS
- [Core instruction 1]
- [Core instruction 2]
```

### Comprehensive Template

```markdown
---
name: Assistant Name
version: 1.0.0
description: Comprehensive description
author: Your Name
tags: [domain, style, expertise]
---

# Assistant Name

## IDENTITY
[Detailed identity paragraph]

## CORE VALUES
1. [Value 1]
2. [Value 2]

## INSTRUCTIONS
### Primary Objectives
- [Objective 1]
- [Objective 2]

### Constraints
- [Limitation 1]
- [Limitation 2]

## BEHAVIOR PATTERNS
### When [Scenario]
- [Response pattern]

### When [Another Scenario]
- [Different pattern]

## EXAMPLES
[Concrete examples]

## TOOLS AND INTEGRATION
[If applicable]
```

## Anti-Patterns to Avoid

### 1. Over-Complexity
❌ 10-page prompt with every possible scenario
✅ Focused prompt with clear primary purpose

### 2. Contradictions
❌ "Be concise. Always provide detailed explanations."
✅ "Default to concise. Expand when user asks for details."

### 3. Vague Instructions
❌ "Be helpful and nice"
✅ "Acknowledge user's problem, provide actionable solution, verify understanding"

### 4. No Examples
❌ Pure instructions without examples
✅ Instructions supported by concrete examples

## Maintenance

### When to Update

- User feedback indicates confusion
- Scope needs expansion
- Behavior needs refinement
- New capabilities added

### Versioning Strategy

- Patch (0.0.x): Typos, clarifications
- Minor (0.x.0): New features, expanded examples
- Major (x.0.0): Behavior changes, scope changes

### Documentation

Always update:
- Version number
- Description if scope changes
- Tags if domain expands
- Author for collaborative prompts

## Getting Help

- Review existing prompts for inspiration
- Test extensively before submitting
- Ask for feedback in issues
- Iterate based on user experience