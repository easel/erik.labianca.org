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

# Verify innsigle seals (public keys only, safe in CI)
verify-seals:
    #!/usr/bin/env bash
    set -euo pipefail
    # Uses public keys and claims only — no 1Password, no private key — so this
    # is safe in CI and pre-commit. It catches the failure mode nothing else
    # does: a post edited after sealing still builds and deploys fine, it just
    # silently renders no seal on the page.
    if ! command -v innsigle >/dev/null 2>&1; then
        echo "innsigle not installed. Install the pinned version:" >&2
        echo "  npm i -g github:DocumentDrivenDX/innsigle#v0.6.1" >&2
        exit 1
    fi
    innsigle verify --all
    innsigle doctor --hugo

# Re-seal content after editing (needs 1Password, local only)
seal:
    #!/usr/bin/env bash
    set -euo pipefail
    # Signing needs the private key from 1Password, so this can never run in
    # CI. Run it after any change under content/, then commit the updated
    # claims in .innsigle/public/claims/.
    OP_ACCOUNT="${OP_ACCOUNT:-labiancas.1password.com}" innsigle seal --all
    just verify-seals

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
