# Development Workflow

This document explains the recommended development workflow for Fit AI Chain contributors.

---

# Workflow Overview

The project follows a feature-branch-based Git workflow.

Main goals:

- Keep changes isolated
- Improve collaboration
- Simplify pull request reviews
- Reduce merge conflicts

Contributors are encouraged to discuss larger changes in GitHub issues before implementation.

---

# Recommended Workflow

```text
Fork Repository
  ↓
Clone Fork
  ↓
Create Feature Branch
  ↓
Make Changes
  ↓
Test Changes
  ↓
Commit Changes
  ↓
Push Branch
  ↓
Open Pull Request
```

---

# 1. Fork the Repository

Create your own copy of the repository on GitHub.

---

# 2. Clone Your Fork

```bash
git clone https://github.com/your-username/Fit-AI-Chain.git
cd Fit-AI-Chain
```

---

# 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b docs/api-documentation
git checkout -b fix/authentication-bug
```

---

# 4. Make Focused Changes

Keep pull requests focused on a single task or feature.

Good examples:

- Documentation improvements
- API fixes
- UI improvements
- Refactoring

Avoid:
- Unrelated formatting changes
- Large mixed pull requests

---

# 5. Test Before Committing

Recommended checks:

```bash
npm run dev
```

Optional checks:

```bash
npm run lint
```

---

# 6. Commit Changes

```bash
git add .
git commit -m "docs: improve API documentation"
```

Use clear and descriptive commit messages.

---

# 7. Push to GitHub

```bash
git push origin feature/your-feature-name
```

---

# 8. Open Pull Request

Create a pull request from your fork to the main repository.

Include:

- Summary of changes
- Screenshots if applicable
- Related issue references

Reference the related GitHub issue number when opening pull requests.

---

# Pull Request Best Practices

- Keep PRs small and reviewable
- Write clear descriptions
- Respond to review feedback
- Avoid unnecessary file changes

Documentation pull requests should maintain consistent markdown formatting across all files.

---

# Branch Naming Suggestions

| Type | Example |
|---|---|
| Documentation | `docs/improve-readme` |
| Feature | `feature/meal-suggestions` |
| Bug Fix | `fix/session-bug` |
| Refactor | `refactor/api-cleanup` |

---

# Collaboration Guidelines

- Respect coding standards
- Review existing code before modifying
- Avoid duplicate work
- Communicate clearly in issues and PRs

---

# Related Documentation

- [First Contribution Guide](../getting-started/FIRST_CONTRIBUTION.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Contributing Guide](../contributing/CONTRIBUTING.md)