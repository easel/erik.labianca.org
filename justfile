# Default: list available commands
default:
    @just --list

# Local dev server with correct baseURL (no redirect to production)
serve:
    hugo server --baseURL http://localhost:1313 --appendPort=false -D

# Production build (pass extra args for CI, e.g. just build --baseURL "...")
build *args:
    hugo --gc --minify {{ args }}

# Lint: Hugo warnings + markdown style
lint:
    #!/usr/bin/env bash
    set -euo pipefail
    output=$(hugo --gc --minify 2>&1) || { echo "$output"; exit 1; }
    if echo "$output" | grep -q WARN; then
        echo "$output" | grep WARN
        exit 1
    fi
    rumdl check content/

# Format markdown files
fmt:
    rumdl fmt content/

# Create a new post
new slug:
    hugo new content posts/$(date +%Y-%m-%d)-{{slug}}.md

# Run Playwright page checks against local server
check:
    npx playwright test || node check-pages.mjs

# Push current branch to master (deploy)
deploy:
    git push origin next:master
