---
title: "Syncthing ate my git repository"
date: 2026-09-30T09:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "Syncthing replicating a live .git directory cost me a tree object. Rebuilding it from a clean working directory produced the identical hash."
composition: model-primary
categories:
  - Computing
tags:
  - git
  - syncthing
  - recovery
syndication:
  twitter_text: >-
    fatal: unable to read tree. Syncthing had been replicating my live .git
    directories, producing conflict copies inside .git/objects — and
    conflicted copies of refs/heads/main.
  linkedin_hook: |
    A git tree object is a deterministic function of its contents.

    That turned out to matter. Syncthing had been replicating my repos' live .git directories, and one of them lost a tree object — the terraform/ subtree of HEAD. Every git status, add and commit died.

    The remote was seven commits behind, so it couldn't help. But the working tree still had that directory complete, and I had the pre-edit copy of the one file I'd changed.

      git read-tree --empty && git add -A . && git write-tree

    Same hash. Git rewrote the missing object from content.
---

I keep a few infrastructure repos in `~/Sync`, a Syncthing folder shared between
my laptop, my desktop and a NAS. It's a convenient way to have the working trees
follow me around. The repos also have real git remotes — a bare repo on the NAS
— so Syncthing was never the mechanism for sharing history, just for keeping
the directories in step.

One afternoon I made a small change to a Terraform file, went to commit it, and
got this:

```console
$ git commit
fatal: unable to read tree (473e86e595d886a54429b17de3b923d8c8373ef8)
```

`git status` failed the same way. So did `git add`. The repository was unusable
for anything that needed to compare against HEAD.

## What Syncthing did to the object store

`git fsck` found the shape of it immediately:

```text
broken link from    tree 67a06ff4a3f66fb402564609cea5fe3b6086cab4
              to    tree 473e86e595d886a54429b17de3b923d8c8373ef8
missing tree 473e86e595d886a54429b17de3b923d8c8373ef8
```

`67a06ff4` is HEAD's root tree. The missing object is its `terraform/` subtree —
one entry in the top-level tree of the current commit, gone from the object
store.

Then I looked for the mechanism and found it sitting in plain sight:

```console
$ find ~/Sync -path "*/.git/*" -name "*sync-conflict-*"
~/Sync/azgaard/.git/objects/cc/1a4a36...sync-conflict-20260929-120727-LNRZ3HT
~/Sync/timbuktu/.git/objects/e4/a39492...sync-conflict-20260225-152925-PZOARVU
~/Sync/timbuktu/.git/objects/e0/76ba10...sync-conflict-20260225-152925-PZOARVU
~/Sync/timbuktu/.git/refs/heads/main.sync-conflict-20260225-152925-PZOARVU
~/Sync/timbuktu/.git/index.sync-conflict-20260225-152925-PZOARVU
~/Sync/sahara/.git/index.sync-conflict-20260225-155945-PZOARVU
...
```

Nine of them across four repos. Syncthing had been treating git's object store
as ordinary files — which it is, from Syncthing's point of view — and forking
them on conflict. Note what's in that list: not just loose objects, but
`.git/index` and `.git/refs/heads/main`. Syncthing had produced conflicting
copies of a branch ref.

The timestamps are the uncomfortable part. Most are from February. One is from
**that same afternoon, 12:07** — created while I was actively working in the
repo. This wasn't a historical accident I was cleaning up; it was ongoing.

There was no `.stignore` in `~/Sync`, so every `.git` directory in there had
been replicating continuously, including while git was mid-write.

## The remote was seven commits behind

The obvious fix is to fetch the missing object from the bare repo on the NAS.
That failed for two reasons, and the second one is more interesting.

First, the NAS was down — I was in the middle of rebuilding its boot disk, which
is a separate story. Once it was back, the remote's `HEAD` pointed at
`refs/heads/master` while the actual branch was `main`, so a plain `git clone`
produced an empty repository and briefly convinced me the remote was empty too.
Cloning with `-b main` got 42 commits and a clean `fsck`.

But the remote's `main` was at `d0b826a`, and my local HEAD was `3d9b9cd` —
seven commits ahead. Those commits, and every object they introduced including
the damaged tree, existed only on my laptop. That made the remote a backup of an
older state, and backups that are behind don't help with what you broke since.

## Reconstructing a tree object from content

Here's the part worth knowing. A git tree object is a deterministic function of
its contents: entry names, modes, and the hashes they point to. If you can
reproduce the exact content, git will write the exact object — same hash.

The missing tree was HEAD's `terraform/` directory. My working tree still had
that directory complete on disk, and the only difference from HEAD was the one
file I'd edited that afternoon. I had the pre-edit copy. So restoring it made
the working directory byte-identical to HEAD:

```sh
cp firewall_ipv4.tf.bak terraform/inferno-firewall/firewall_ipv4.tf

export GIT_INDEX_FILE=/tmp/rebuild-idx
git read-tree --empty
git add -A .
git write-tree
```

Using a temporary index matters: `git add` against the real index would need to
read HEAD, which is the operation that's broken. `read-tree --empty` into a
scratch index builds purely from the filesystem.

```text
root tree written:  67a06ff4a3f66fb402564609cea5fe3b6086cab4
HEAD's root tree:   67a06ff4a3f66fb402564609cea5fe3b6086cab4
```

Exact match. `git write-tree` writes every subtree it needs along the way, so
`473e86e5` came back as a side effect of producing the root. After that,
`git cat-file -t 473e86e5...` returned `tree`, `git status` worked again, and
`git fsck` was clean once I deleted the nine conflict files that were sitting
in the object stores confusing it.

This only works when you can reproduce the content exactly. If I'd already
committed over the file, or the working tree had drifted, the hash wouldn't have
matched and I'd have been rebuilding history instead. Check which case you're in
before reaching for anything more drastic.

## The one-line prevention

```text
# ~/Sync/.stignore
.git
```

That's it. Syncthing stops replicating git metadata, the working trees still
sync, and the repos share history the way they always should have — through
their remotes.

The tradeoff is real and worth stating: with `.git` ignored, the directories on
other machines aren't repositories any more, just files. If you were relying on
Syncthing to carry your branch state between machines, this takes that away. I'd
argue you shouldn't have been relying on it, since the failure mode is a
corrupted object store rather than a merge conflict you can see, but it is a
behaviour change.

I also went looking for whether this was a known pattern, and it is —
Syncthing's own documentation warns against syncing files that are being written
by a running application, and git's object store is a textbook case. The
directory next to my repos on the NAS had three folders named
`7thsense.dolt.corrupt-20260311T015104` and similar, from a database that had
lost the same argument months earlier. The evidence had been sitting there the
whole time.

## Notes

- `git fsck` names the broken link and the missing object; start there.
- A tree object is a pure function of its content. If the working directory can
  be restored to match, `git write-tree` regenerates the object with the same
  hash.
- Use `GIT_INDEX_FILE` with a scratch index when the real index operations need
  a HEAD you can't read.
- Check `find . -path "*/.git/*" -name "*sync-conflict*"` — conflict copies of
  `index` and `refs/heads/*` mean the damage is broader than loose objects.
