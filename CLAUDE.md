# Claude Code Instructions

Read [AGENTS.md](./AGENTS.md) for full project conventions, structure, and workflows.

## Quick Reference

- **Hugo site** with PaperMod theme, deployed to GitHub Pages
- Posts go in `content/posts/` as markdown with YAML front matter
- Preview: `hugo server -D` (includes drafts)
- Build: `hugo` (outputs to `public/`)
- New post: `hugo new content posts/YYYY-MM-DD-slug-title.md`
- Theme is a git submodule — override via `layouts/`, never edit `themes/` directly
