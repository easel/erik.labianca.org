# Claude Code Instructions

Read [AGENTS.md](./AGENTS.md) for full project conventions, structure, and workflows.

## Quick Reference

- **Hugo site** with PaperMod theme, deployed to GitHub Pages
- Posts go in `content/posts/` as markdown with YAML front matter
- Model-drafted posts go in `content/agent/`
- **Editing anything under `content/` requires `just seal`** — content carries
  signed innsigle provenance claims, and a stale seal renders nothing at all
  while the build still succeeds. `just verify-seals` runs in pre-commit and CI.
- Preview: `hugo server -D` (includes drafts)
- Build: `hugo` (outputs to `public/`)
- New post: `hugo new content posts/YYYY-MM-DD-slug-title.md`
- Theme is a git submodule — override via `layouts/`, never edit `themes/` directly
