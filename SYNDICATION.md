# Content Syndication Strategy

Blog as canonical source. Platform-native adaptations where algorithms demand it.

## Platform Analysis (2026)

### X / Twitter — Direct links

X dropped external link penalties in Oct 2025. Tweet with link + commentary works.

- **Format:** Short text (tweet-length) + direct link to blog post
- **Front matter field:** `syndication.twitter_text`
- **Share action:** Pre-filled `x.com/intent/tweet` with custom text + URL

### LinkedIn — Native posts only

LinkedIn penalizes external links ~60% in reach. The algorithm rewards native
content that keeps users on-platform.

- **Format:** Standalone post that delivers the key insight. No link in body.
  Soft CTA at end ("I wrote more about this on my blog" or similar).
- **Front matter field:** `syndication.linkedin_hook`
- **Share action:** Copy button for pre-written post text. Standard share URL
  as fallback.

### Other platforms

Not actively targeted. The share UI only includes X and LinkedIn.

## Front Matter Convention

Syndication fields live under a `syndication:` key to keep the top-level
namespace clean:

```yaml
syndication:
  twitter_text: "Short text to accompany the blog link (~280 chars)"
  linkedin_hook: |
    Standalone LinkedIn post. Delivers the key insight.
    No link in body. Soft CTA at end.
```

Hugo accesses these via `.Params.syndication.twitter_text` and
`.Params.syndication.linkedin_hook`.

Both fields are optional. When absent:
- X share link falls back to post title
- LinkedIn hook section is hidden entirely

## Implementation

The share UI is implemented as a PaperMod partial override:

- `layouts/partials/share_icons.html` — X + LinkedIn share buttons with
  collapsible sections for pre-written text
- `layouts/partials/extend_footer.html` — Copy-to-clipboard JavaScript
- `assets/css/extended/syndication.css` — Styling (auto-loaded by PaperMod)

Activated by `showShareButtons: true` in `hugo.yaml`. PaperMod's `single.html`
calls `share_icons.html` automatically — no theme file edits needed.
