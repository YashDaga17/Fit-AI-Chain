# First Contribution Guide

Welcome to Fit AI Chain!

This guide helps first-time contributors set up the project, understand the workflow, and submit their first pull request.

---

# Prerequisites

Before contributing, ensure you have:

- Git installed
- A GitHub account
- Node.js 18+
- Basic understanding of React / Next.js
- A code editor such as VS Code

---

# 1. Fork the Repository

Click the **Fork** button on GitHub to create your own copy of the repository.

---

# 2. Clone Your Fork

```bash
git clone https://github.com/your-username/Fit-AI-Chain.git
cd Fit-AI-Chain
```

---

# 3. Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

Use a descriptive branch name related to your task.

---

# 4. Install Dependencies

```bash
npm install
```

---

# 5. Configure Environment Variables

Create:

```bash
cp .env.example .env.local
```

Update the required environment variables before running the application.

---

# 6. Start the Development Server

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

# 7. Make Your Changes

Examples:
- Fix bugs
- Improve documentation
- Add new features
- Refactor components
- Improve UI/UX

---

# 8. Commit Your Changes

```bash
git add docs/
git commit -m "docs: improve project documentation"
```

Write clear and meaningful commit messages.

---

# 9. Push Your Branch

```bash
git push origin feature/your-feature-name
```

---

# 10. Open a Pull Request

Create a pull request from your forked branch to the main repository.

Include:
- What you changed
- Why the change was needed
- Screenshots if applicable

---

# Contribution Tips

- Keep pull requests focused
- Follow project coding standards
- Test changes before submitting
- Avoid unrelated modifications
- Read existing documentation first
- Sync your branch with the latest project updates before opening large pull requests

---

# Common Beginner Tasks

- Documentation improvements
- UI fixes
- Refactoring
- Bug fixes
- Adding tests
- Improving accessibility
- Improving markdown documentation structure
- Organizing project files

---

# Recommended Workflow

1. Fork the repository
2. Create a feature branch
3. Make focused changes
4. Test locally
5. Commit changes
6. Push to your fork
7. Open a pull request

# Need Help?

If you get stuck:
- Check the documentation
- Read existing issues
- Ask maintainers for clarification
- Review previous pull requests