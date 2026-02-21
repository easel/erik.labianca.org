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
.github/workflows/
  hugo.yml        # Deploy to GitHub Pages on push to master
  pr.yml          # PR check — validates Hugo build on pull requests
```

## Branching and Merging

The `next` branch is the working branch. Changes are merged to `master`
for deployment. Use regular merges (not squash) to keep histories joined —
squash merges break shared history and cause add/add conflicts on subsequent
merges.

### Worktrees

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

### Content Policy

This is a technical blog. Only publish **pure technical posts** — hands-on
problem-solving, benchmarks, configuration guides, debugging notes. The
following types of content are drafted (hidden) and should stay that way:

- **Management/business opinion** — naive takes on org theory, hiring advice, vendor tips
- **Explainer/overview pieces** — VoIP, NAS, virtualization, DVCS advocacy
- **Industry commentary** — opinion on industry news, social media takes
- **Blog housekeeping** — "first post", location changes, site merges

The imported WordPress content has broken external image references that have
been removed. Do not re-add external image URLs from the original WordPress
site (erik.labianca.org/blog/wp-content/) — they are dead.

## Preview and Build

```bash
hugo server -D              # dev server with drafts at localhost:1313
hugo server                 # dev server without drafts
hugo                        # build to public/
```

The dev server live-reloads on file changes.

## CI/CD

- **PR checks** (`pr.yml`): Runs `hugo --gc --minify` on pull requests to
  `master`. Build must pass before merging.
- **Deploy** (`hugo.yml`): On push to `master`, builds and deploys to GitHub
  Pages at `erik.labianca.org` (custom domain via CNAME to `easel.github.io`).

Hugo version is pinned to **0.156.0 extended** in both workflows.

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
