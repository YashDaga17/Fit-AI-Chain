# Pull Request Guide

This document explains how to submit pull requests for Fit AI Chain.

---

# Pull Request Goals

Good pull requests should:

- Be focused
- Be reviewable
- Include clear descriptions
- Avoid unrelated changes
- Maintain project consistency

---

# Before Opening a Pull Request

Before submitting:

- Test changes locally
- Review modified files
- Check formatting consistency
- Verify documentation updates

Review staged files carefully to avoid accidentally including unrelated changes.

---

# Recommended Pull Request Workflow

```text
Create Branch
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
  ↓
Respond to Feedback
```

---

# Pull Request Title Examples

Good examples:

```text
docs: improve API documentation
fix: resolve leaderboard cache issue
feature: add meal suggestions page
```

---

# Pull Request Description

Recommended PR description structure:

```md
## Summary

Describe the changes.

---

## Changes Made

- Added new documentation
- Improved API examples
- Updated architecture explanations

---

## Related Issue

Closes #issue-number
```

---

# Documentation Pull Requests

Documentation PRs should:

- Maintain markdown consistency
- Use clean formatting
- Avoid duplicated information
- Keep sections organized

Documentation migrations should preserve consistent structure across all documentation sections.

---

# Code Pull Requests

Code contributions should:

- Follow coding standards
- Avoid unrelated refactors
- Maintain readability
- Keep logic modular

---

# Review Process

During review:

- Respond respectfully
- Address feedback clearly
- Keep discussions constructive

Contributors should respond to requested changes professionally and clearly.

---

# Common Pull Request Problems

Avoid:

- Large unrelated changes
- Missing documentation
- Unclear commit history
- Untested features

---

# Merge Expectations

Pull requests may be merged after:

- Maintainer approval
- Successful review
- Required fixes completed

---

# Related Documentation

- [Contributing Guide](./CONTRIBUTING.md)
- [Workflow Guide](../development/WORKFLOW.md)
- [Coding Standards](../development/CODING_STANDARDS.md)