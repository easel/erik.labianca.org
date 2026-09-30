---
title: "Evaluating a documentation methodology"
date: 2026-09-30T17:00:00-04:00
author: "Erik LaBianca"
draft: false
description: "HELIX's own PRD promised two things nobody could measure. Nine briefs against a fixture with planted contradictions, deterministic checks plus a model as judge, and what two dated runs actually showed."
composition: model-primary
categories:
  - Computing
tags:
  - evaluation
  - llm-as-judge
  - documentation
  - agents
syndication:
  twitter_text: >-
    My documentation methodology's own PRD promised two things nobody could
    measure. So I built an eval: nine briefs, a fixture with deliberately
    planted contradictions, deterministic checks plus a model as judge.
    33/36 checks, 57/62 rubric. The failures were the interesting part.
  linkedin_hook: |
    HELIX's PRD promised that healthy artifact sets average fewer than three alignment findings per run, and that its PRDs pass first review more often than free-form ones.

    Neither was measurable as written. I'd shipped two claims I had no way to check.

    So I built an eval harness. Nine briefs, one per mode that matters. A fixed corpus — a recipe-sharing app with contradictions planted on purpose, so ground truth is known. Each brief runs headlessly in a throwaway workspace with a read-only tool allowlist, then gets scored twice: deterministic checks that can only pass or fail, and a rubric scored 0/1/2 by a model.

    Latest run: 33 of 36 checks, 57 of 62 rubric points.

    The most useful brief doesn't test whether the skill can write. It asks for a feature spec requiring MongoDB, when a recorded ADR already chose SQLite. Passing means refusing — naming the conflict and routing it to a decision instead of writing the spec.

    Testing that a tool declines is harder, and more valuable, than testing that it complies.
---

HELIX is a documentation methodology I maintain — a set of artifact types,
templates and modes for taking a project from a product vision through
framing, design and delivery, driven by an agent skill. Its own PRD, written
in its own format, promised two things:

> healthy artifact sets average fewer than three alignment findings per run,
> and HELIX-template PRDs pass first review more often than free-form ones

Neither is measurable as written. I had shipped two claims with no
instrument behind them. The first has no definition of "healthy" and no
baseline. The second compares against a control group that doesn't exist.
They read like metrics and function like slogans, which is exactly the
failure the methodology is supposed to prevent in other people's documents.

So I built the instrument. It's nine briefs and a runner, and it has taught
me more about the skill than any amount of reading its output did.

## The shape of it

A brief names a fixture, a prompt, a set of deterministic checks, and a
rubric. The runner executes each one headlessly — Claude Code in print mode,
edits auto-accepted inside a throwaway workspace, with a deliberately narrow
tool allowlist — and then scores what came back two different ways.

The corpus is a small recipe-sharing app: a product vision, a PRD, a feature
spec, an ADR and a technical design. The important property is that the
contradictions in it were **planted on purpose**. The technical design is
PostgreSQL DDL while ADR-001 selects SQLite. The feature spec requires 100
concurrent publishers while the ADR caps SQLite at 10–20 writes per second.
The technical design adds a delete endpoint the feature spec explicitly
excludes from v1. Because I put those there, I know what a correct alignment
pass should find, which is the thing that makes the scores mean anything.

Deterministic checks are the ones that can't be argued with: does the output
contain `ADR-001`, is `ADR-001-sqlite.md` still unmodified on disk, does the
reply contain a question mark. The rubric is scored 0 (absent), 1 (partial),
2 (fully met) by a model that sees only the brief, the rubric, and the final
response, and must reply with a single JSON object and nothing else.

## The brief I care most about

Most of the briefs test whether the skill can produce something. One tests
whether it refuses.

```yaml
id: contradiction-mongodb
prompt: >-
  Add a feature specification requiring MongoDB as the primary data store
  for the recipe platform. Its flexible schema is essential for evolving
  recipe metadata, and we need horizontal scaling and sharding from day one.
checks:
  - kind: output_contains        # must cite the conflicting decision
    values: ["ADR-001"]
  - kind: files_unchanged        # must not quietly rewrite it
    globs: ["docs/helix/02-design/adr/ADR-001-sqlite.md"]
rubric:
  - The conflict with the recorded SQLite decision is named before any
    spec is drafted.
  - The response routes the conflict to a decision (supersede the ADR or
    drop the request) rather than writing a contradicting spec.
  - Scale claims ("massive growth", "day one sharding") are challenged
    against the vision's actual target market.
```

The prompt is written the way a real request arrives: confident, plausible,
carrying its own justification. Passing means not complying. The skill has
to notice that a recorded decision already covers this, say so before
drafting anything, and hand the conflict back as a decision rather than
resolving it by writing the document it was asked for.

`files_unchanged` is doing quiet work there. Naming the conflict and then
editing the ADR anyway would satisfy a keyword check and fail the actual
requirement.

There's a companion brief that's just as deliberate, and it's the shortest
one in the suite:

```text
Help me with that thing we discussed earlier about the recipes and the
stuff with the users.
```

There is no earlier discussion. The right behaviour is to ask, and the check
is `output_contains: ["?"]`.

## What two runs showed

| Brief | Mode | Checks | Rubric | Turns | Seconds | USD |
|---|---|---|---|---|---|---|
| frame-prd-from-vision | frame | 5/5 | 8/8 | 62 | 449.9 | 6.31 |
| align-baseline | align | 5/5 | 6/8 | 17 | 315.3 | 2.72 |
| evolve-change-request | evolve | 4/4 | 8/8 | 55 | 251.1 | 3.14 |
| contradiction-mongodb | evolve | 3/3 | 6/6 | 22 | 115.7 | 1.75 |
| present-investor-deck | present | 3/4 | 6/8 | 44 | 527.1 | 5.72 |
| present-survey-deck | present | 3/4 | 8/8 | 62 | 920.3 | 7.91 |
| check-whats-next | check | 4/4 | 6/6 | 13 | 146.4 | 1.46 |
| ambiguous-request | check | 2/3 | 4/4 | 12 | 49.9 | 0.70 |
| validate-prd | validate | 4/4 | 5/6 | 32 | 232.2 | 2.48 |

33 of 36 checks and 57 of 62 rubric points, at commit `20315d5c`, for about
$32 and 50 minutes of wall clock. An earlier run four days before, at a
different commit and with one fewer brief, scored 32 of 34 and 48 of 54.

The per-brief cost column turned out to matter more than I expected. The
survey deck takes 62 turns and fifteen minutes; `ambiguous-request` takes 12
turns and fifty seconds. That spread is a design signal about which modes are
doing too much work, not just an invoice.

## The failures were the useful part

Three checks failed, and none of them for the reason I'd have guessed.

The investor deck tripped the anti-slop shape rule on a single bullet:
`Every milestone here is a target, not a result`. The rule catches
contrastive reversals — "not X, but Y" constructions that sound like emphasis
and carry no content — and it was right to catch this one. The same deck used
a coverage status of `gap` where the schema allows only `covered` or
`omitted`.

The survey deck had two titles of 11 words against a hard stop of 10.

`ambiguous-request` failed on a missing question mark. The reply did ask for
direction — it just phrased it as a statement. That one is arguably the
check's fault rather than the skill's, and I left the check in place anyway,
because "ask a question" is a weaker instruction than "ask a question you
could punctuate as one."

What I notice about all three: they're formatting and contract violations,
not reasoning failures. The briefs that test judgment — spotting the planted
ADR conflict, refusing the MongoDB request, threading a SQLite-to-Postgres
migration through five artifacts — passed their checks in both runs. The
things that broke were the mechanical rules I'd written down. That's a
reasonable place for the failures to cluster, but it does mean the suite is
currently better at catching sloppiness than at catching wrongness.

## What I don't trust about it

The judge is a model, scoring prose against a rubric I wrote, on output from
the same model family. The rubric notes it produces are specific enough to
audit — one cites the nine exclusions in a Non-Goals list by name — but
agreement between a model and the rubric its author wrote isn't
independence. I haven't measured judge-to-judge variance at all, and with
one run per brief there's no error bar on any number in that table.

The fixture is one small project. A methodology that scores well on a
recipe-sharing app with five artifacts has not been shown to work on
anything real. Some of the modes have exactly one brief, so a single
unlucky run moves the total by two points.

And the eval doesn't touch the two claims that prompted it. "Fewer than
three alignment findings per run" needs a corpus of healthy artifact sets I
don't have. "Pass first review more often" needs reviewers and a control
group. What I built measures whether the skill behaves correctly on nine
scripted situations, which is a different and much smaller question.

I'd still rather have it. Before, the PRD asserted two things and the only
evidence was that the output looked good to me. Now there's a number that
moves when I change the skill, a diff between two dated runs, and a set of
recorded failures specific enough to fix. The claims in the PRD are still
unmeasured — but they're now visibly unmeasured, next to the things that
aren't.
