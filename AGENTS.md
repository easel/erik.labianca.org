# Agentic Development Guide

This document describes conventions for AI agents working in this repository.

## Project Overview

- **Site:** [erik.labianca.org](https://erik.labianca.org/)
- **Generator:** [Hugo](https://gohugo.io/) with [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme
- **Hosting:** GitHub Pages via GitHub Actions
- **Repo layout:** Bare-repo + worktree via [worktrunk](https://github.com/max-sixty/worktrunk) (`wt`)

## Repository Structure

```
content/
  posts/          # Blog posts (markdown)
  about.md        # About page
  archives.md     # Archive layout page
  search.md       # Search layout page
themes/PaperMod/  # Theme (git submodule — do not edit)
static/           # Static assets (images, files)
hugo.yaml         # Site configuration
.github/workflows/hugo.yml  # GitHub Pages deployment
```

## Working with Worktrees

This repo uses worktrunk for branch/worktree management:

```bash
wt switch -c my-feature       # create branch + worktree
wt switch my-feature           # switch to existing worktree
wt list                        # see all worktrees
wt merge                       # squash + merge + cleanup
```

For parallel agent work:
```bash
wt switch -x claude -c task-name -- 'description of work'
```

## Creating a New Blog Post

```bash
hugo new content posts/YYYY-MM-DD-slug-title.md
```

This creates a draft post from the archetype. Front matter format:

```yaml
---
title: "Post Title"
date: 2026-02-20
draft: false
tags: ["tag1", "tag2"]
categories: ["category"]
description: "Brief description for RSS and social cards"
---
```

### Content Guidelines

- Use standard markdown, not HTML
- Use fenced code blocks with language identifiers (```bash, ```go, etc.)
- Place images in `static/images/posts/` and reference as `/images/posts/filename.png`
- Keep front matter `description` under 160 characters for SEO
- Set `draft: true` while working, `draft: false` when ready to publish

## Preview and Build

```bash
hugo server -D              # dev server with drafts at localhost:1313
hugo server                 # dev server without drafts
hugo                        # build to public/
```

The dev server live-reloads on file changes.

## Deployment

Deployment is automatic via GitHub Actions on push to `master`. The workflow:
1. Checks out repo + submodules
2. Runs `hugo --minify`
3. Deploys `public/` to GitHub Pages

## Theme Customization

The PaperMod theme is a git submodule. To override theme templates:
1. Copy the template from `themes/PaperMod/layouts/` to `layouts/`
2. Edit the copy — Hugo uses your local `layouts/` over the theme's

Do NOT edit files inside `themes/PaperMod/` directly.

## Quality Checks Before Merging

1. `hugo` builds without errors or warnings
2. All posts render correctly in `hugo server`
3. RSS feed works (`/index.xml`)
4. No broken links or missing images
5. Front matter is complete (title, date, tags, description)

## Agent Coordination

When multiple agents work in parallel:
- Each agent should work in its own worktree (`wt switch -c task-name`)
- Avoid editing the same files across worktrees
- Configuration changes (hugo.yaml) should be coordinated — only one agent at a time
- Merge frequently to avoid drift
