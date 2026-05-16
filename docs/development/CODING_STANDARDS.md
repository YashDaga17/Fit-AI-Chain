# Coding Standards

This document explains the coding conventions and standards used in Fit AI Chain.

---

# Goals

The coding standards aim to:

- Improve code readability
- Maintain consistency
- Simplify collaboration
- Reduce bugs
- Improve maintainability

---

# General Principles

Follow these principles:

- Write readable code
- Keep components modular
- Avoid duplication
- Use meaningful naming
- Keep functions focused

Favor maintainable and scalable solutions over overly complex implementations.

---

# TypeScript Standards

Guidelines:

- Prefer TypeScript types over `any`
- Use clear interfaces
- Keep types reusable
- Avoid unnecessary type complexity

Example:

```ts
interface UserProfile {
  id: string;
  username: string;
  totalXp: number;
}
```

---

# React Component Standards

Recommendations:

- Keep components small
- Use reusable UI patterns
- Separate logic from presentation
- Use descriptive component names

Shared UI logic should be reused through centralized components whenever possible.

Example:

```tsx
function UserCard() {
  return <div>User Profile</div>;
}
```

---

# File Naming Conventions

| Type | Convention |
|---|---|
| Components | PascalCase |
| Utility files | camelCase |
| Markdown docs | UPPERCASE |
| API routes | kebab-case |

Examples:

```text
WalletConnect.tsx
db-utils.ts
QUICKSTART.md
analyze-food
```

---

# API Development Standards

API routes should:

- Validate input
- Handle errors properly
- Return consistent JSON
- Avoid duplicated logic

Example response:

```json
{
  "success": true,
  "message": "Operation completed"
}
```

---

# Database Standards

Recommendations:

- Use centralized database utilities
- Avoid duplicated queries
- Use schema-based validation
- Keep migrations organized

---

# Styling Standards

The frontend uses:

- Tailwind CSS
- shadcn/ui

Recommendations:

- Prefer reusable utility classes
- Keep layouts responsive
- Maintain consistent spacing
- Avoid unnecessary inline styles

---

# Documentation Standards

Documentation should:

- Use clear headings
- Stay beginner-friendly
- Keep formatting consistent
- Avoid unnecessary complexity

Markdown documentation should maintain consistent section formatting across all files.

---

# Git Standards

Recommendations:

- Use descriptive commit messages
- Keep commits focused
- Avoid unrelated changes

Example:

```bash
git commit -m "docs: improve architecture documentation"
```

---

# Related Documentation

- [Workflow Guide](./WORKFLOW.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Contributing Guide](../contributing/CONTRIBUTING.md)