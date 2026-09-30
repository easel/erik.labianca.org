---
title: "Why the build key can't sign human writing"
date: 2026-09-30T16:30:00-04:00
author: "Erik LaBianca"
draft: false
description: "One signing key sealed both curated and generated documentation, which meant a CI secret could certify a page as human-written. Splitting it into a human key and a build key, and what happened when the build key went missing."
composition: model-primary
categories:
  - Computing
tags:
  - provenance
  - signing
  - ci
  - innsigle
syndication:
  twitter_text: >-
    One signing key sealed both my curated docs and my generated ones. Which
    meant the GitHub Actions secret could certify a page as human-written.
    Split it: human key in 1Password, build key in CI, human endorses build.
    Then I lost the build key and learned what that costs.
  linkedin_hook: |
    I was signing documentation with a content-provenance tool. One key sealed everything.

    Then I noticed what that actually meant: the GitHub Actions secret that signs model-generated reference pages could equally well sign a page claiming to be human-written. The signature proved the page came from my site. It proved nothing about the label on it.

    A provenance system whose labels can be forged by its own CI is decoration.

    The fix is two keys, one issuer. The human key lives in 1Password and never enters CI; it signs human-authored and mixed content. The build key lives in CI and signs generated content only. The human key publishes an endorsement of the build key, so a reader who trusts the human key can decide how far that trust extends.

    There's a second trap underneath. Rendered HTML is a deterministic function of the sealed markdown. Signing the HTML would put the human key in CI and invalidate every signature on the next layout change. So the HTML doesn't get signed — it carries the source signature and quotes it.

    Two weeks later the build key was gone. That part of the story is less flattering.
---

I seal my documentation with [innsigle](https://github.com/DocumentDrivenDX/innsigle),
a small content-provenance tool: each page carries a signed claim saying who
published it and how it was composed — human-authored, model-primary, or
mixed. For a while, one key signed all of it.

That's fine right up until you notice what the key is actually asserting.
Generated reference pages are built and sealed in CI, so the private key has
to be a GitHub Actions secret. Curated pages are written by hand and claim
`mixed` or `human-authored`. Same key, same signature. Which means the CI
secret — a value sitting in a repository settings page, readable by any
workflow, restorable by anyone with admin — can produce a page that says a
person wrote it.

The signature still proves the page came from my issuer. It proves nothing
at all about the label, and the label is the entire point. A provenance
system whose composition claims can be minted by its own build pipeline is
decoration.

## Two roles, one issuer

The fix is to split custody along the line the claims already draw:

| Role | Custody | Seals |
|------|---------|--------|
| **human** | 1Password, local only, never in CI | `human-authored` and `mixed` sources |
| **build** | CI secret, or a gitignored local PEM | `model-primary` and `generated: true` sources |

Both public keys live in the same issuer document, so a verifier fetches one
`keys.json` and finds both. Identity is still the key id plus the URL the
document was served from. The `role` field on each key is display only — it
tells a reader what they're looking at, it doesn't enforce anything. The
enforcement is that the human key's private half isn't in CI, so CI
physically cannot produce a `mixed` claim.

The human key then publishes an endorsement over the build key's id, with
purpose `build-signing`. That's the piece that keeps this from being two
unrelated identities: a reader who has decided to trust the human key can
follow the endorsement and see exactly how far that trust was extended, and
to what. It's a small, boring web of trust with two nodes.

## The thing I got wrong first

My initial instinct was to sign the rendered HTML. That's what a reader
actually receives, so it seemed like the honest object to sign.

It's wrong for two reasons, and the second one is the interesting one.

The obvious problem is that HTML is produced by the build, so signing it
means the signing key is in the build, which is the situation I was trying
to get out of.

The subtler problem is that rendered HTML is a **deterministic function of
the sealed markdown**. Every template tweak, every theme bump, every change
to a footer partial produces different bytes for identical content. A
signature over the HTML would go stale on layout changes that didn't touch a
word of the document, and there'd be no way to distinguish "the prose was
edited" from "the CSS class names changed." The signature would be noisy in
exactly the way that trains people to ignore it.

So the HTML doesn't get signed. It **carries** the signature. Each page
embeds the source attestation verbatim in a `application/innsigle+json`
script block and renders a colophon from it, and the signature inside covers
the markdown source. The page is explicit that this is what it's doing —
"the signature covers the markdown source of this page, not these HTML
bytes" — so a reader can go fetch the source and check it themselves rather
than taking the page's word for it.

The build-time check that makes this trustworthy is small: the template
re-hashes the markdown source and compares it to the digest inside the
claim. If they differ it renders nothing at all. An edited-but-unsealed page
shows no seal rather than a seal that would fail verification.

That last behaviour has a failure mode I'll come back to.

## Then I lost the build key

Two weeks later, CI started failing on a single stale claim, and I went
looking for the key to re-sign it.

It wasn't there. Not on my laptop — the checkout I had was cloned twelve
days before the keys were created, so they had never been in it. Not in
1Password, which held keys for two other projects but not this one. Not
committed, correctly. Not on the file server. No Time Machine backup for
that host. And the repository had zero secrets configured, so
`INNSIGLE_BUILD_KEY` was gone too.

Both keys, human and build, were simply absent from every machine I could
reach. `seal --all` reported `no human key` and `no build key` and skipped
every file.

The irony is precise. The tool's whole purpose is to make provenance
durable, and I'd configured it with the private key at a bare filesystem
path — `signing_key: .innsigle/keys/ed25519.priv.pem` — and an empty
`onepassword: {}` block. The config had a slot for exactly the custody
arrangement that would have saved it, and the slot was empty.

## Rotating

With the private halves gone there's no recovery, only rotation. I generated
a new human key into 1Password, generated a new build key, had the human key
endorse it, stored the build key as the CI secret, and re-sealed everything:
25 generated claims by the build key, 17 curated claims by the human key.

Two decisions inside that worth naming.

The old keys stay in `keys.json` with `revoked_at` set rather than being
deleted. A verifier that encounters an old attestation should be able to
learn that its key was revoked on a particular date, which is a different
and more useful answer than the key having silently vanished from the
issuer document.

The new build key is deliberately not backed up anywhere. It's a CI secret
and nothing else. If it's lost again, the recovery is to generate another
one and have the human key endorse it — a two-minute operation, because the
durable key is the one that does the endorsing. Backing up the build key
would mean protecting two secrets to get the security properties of one.

## What I'd tell someone setting this up

Put the human key in a password manager on day one and record the reference
in the tool's config, not a file path. A key at a file path is one
`git clean -xdf`, one fresh clone, or one new laptop from gone, and it goes
without any error until the day you need to sign something.

Make the split along whatever line your claims actually assert. Mine is
human versus generated because that's what the labels say. If your claims
asserted something else, the custody boundary should follow that instead.

And treat "renders nothing on mismatch" as the hazard it is. It's the right
behaviour — better than a seal that fails verification — but it means a site
that has quietly lost every seal looks exactly like one that never had them.
That needs a check that runs on every commit and in CI, or the silence is
the only thing you'll ever see.
