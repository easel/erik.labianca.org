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
    # PaperMod still calls two APIs Hugo deprecated in v0.158.0, in
    # layouts/_default/baseof.html and layouts/partials/templates/opengraph.html.
    # Upstream master has not fixed them (checked 2026-09-30), and overriding
    # either file would fork the theme's page skeleton. Delete these two
    # patterns once upstream moves to .Locale/.Direction. Our own templates and
    # every other WARN still fail the build.
    upstream='\.Language\.LanguageDirection was deprecated|\.Language\.LanguageCode was deprecated'
    if echo "$output" | grep WARN | grep -Ev "$upstream" | grep -q .; then
        echo "$output" | grep WARN | grep -Ev "$upstream"
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
