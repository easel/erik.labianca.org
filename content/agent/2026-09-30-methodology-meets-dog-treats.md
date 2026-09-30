---
title: "A software methodology meets the dog treats market"
date: 2026-09-30T16:45:00-04:00
author: "Erik LaBianca"
draft: false
description: "I installed a software documentation methodology in an empty repo and asked it for a competitive analysis of the dog treats market. It mostly worked, and the place it didn't turned out to be a real gap in the methodology."
composition: model-primary
categories:
  - Computing
tags:
  - documentation
  - methodology
  - agents
  - helix
syndication:
  twitter_text: >-
    I installed my software documentation methodology in an empty repo and
    asked it to analyse the dog treats market. It mostly worked. Where it
    didn't was a real gap: competitive analysis owns market pressure, and
    nothing owned market sizing. The fix belonged in the tool, not the repo.
  linkedin_hook: |
    I installed a software documentation methodology into an empty repository and asked it for a competitive analysis of the dog treats market.

    Not as a joke. The methodology claims its discovery and framing stages are about understanding a problem before committing to a solution, and that claim shouldn't depend on the problem being software.

    It mostly held up. Five Forces, competitor profiles, positioning — the competitive-analysis artifact took it without complaint.

    Then it produced a second document, market-analysis.md, that didn't belong to any artifact type. Market sizing, growth drivers, open questions feeding the next stage. The obvious move was to fold it into competitive analysis. That would have been wrong: competitive analysis owns market *pressure* and position; this owned market *size* and the questions it raises.

    Two documents, two different jobs, one missing type.

    So the fix went upstream — a new artifact type, validated against the existing 48, on a branch against the methodology's own repo. The repo that surfaced the gap wasn't the thing that needed changing.

    That's the useful property of trying a methodology somewhere it wasn't designed for. A domain it doesn't cover will tell you where its type system is thin, and it tells you faster than the domain it was built for.
---

HELIX is a documentation methodology I maintain for software projects:
artifact types, templates and modes that carry a project from a product
vision through framing, design and delivery, driven by an agent skill. Its
first two stages, discover and frame, claim to be about understanding a
problem before committing to a solution.

That claim shouldn't depend on the problem being software. So I tested it in
the least charitable way I could think of: an empty repository, a fresh
install, and a competitive analysis of the dog treats market.

```text
Install helix in this project.
I'd like to do a competitive analysis of the dog treats market
```

That's the whole setup. No configuration beyond the install, no domain
adaptation, no hints that this wasn't a SaaS product.

## Most of it just worked

The `competitive-analysis` artifact type wanted Five Forces, competitor
profiles, and a positioning statement. None of that is software-specific —
it's borrowed from strategy work in the first place — and the agent filled
it in for pet food brands without any apparent friction. The template
constrains the shape of the thinking, not its subject.

The one piece of configuration it did need was the market itself. I had to
tell it:

```text
You should add the .helix.yml market, obviously.
```

which is the kind of small correction that's easy to read as a failure and
is really the system working. The methodology has a config file declaring
what the project is about; a market analysis needs the market declared in
it. It asked me to be explicit about scope rather than inferring a market
from the prompt, which is the behaviour I'd want.

## Where it broke

Then it produced a second document: `market-analysis.md`, sitting in the
discover stage next to the competitive analysis, belonging to no artifact
type at all.

My first instinct was to merge them. One market document is simpler than
two, and the new one looked like an overflow of the first. That would have
been the wrong call, and the reasoning against it is the interesting part of
this whole exercise:

> the content genuinely doesn't fit competitive-analysis's lane — that
> artifact owns market *pressure*, competitors, and position (Five Forces +
> competitor profiles), while market-analysis.md owns market *sizing*, the
> three-sub-lane concept exploration, growth drivers, and open questions
> that feed into Frame

Two documents doing two different jobs. Competitive analysis answers "who
else is here and how hard will this be." Market analysis answers "how big is
this and what don't we know yet." They feed different downstream decisions,
and collapsing them would make the combined artifact answer neither question
cleanly.

The methodology had 48 artifact types at that point. None of them owned
market sizing, because the projects it grew up on already knew what market
they were in. A software team writing a PRD for an internal tool doesn't do
a TAM estimate. Start from "should we sell dog treats" and it's the first
thing you need.

## The fix belonged upstream

This is the part I'd want someone else to take from it. The gap showed up in
a throwaway repo about dog treats, and the fix didn't go in that repo. It
went into the methodology: a new artifact type, built in a clone of the
upstream project, validated against the existing 48 plus the deploy-artifact
graph and the action definitions, on a branch, as a commit meant for a pull
request.

There's a smaller detail I liked. Adding the type broke a test — the
generated site reference hadn't been regenerated and drifted from the type
definitions. That's a methodology with enough internal structure that adding
a type to it is a real change with real consequences, rather than dropping
another markdown template in a folder. It also means the 48 number is
enforced somewhere, not just counted.

## Does this generalise

Partly, and I want to be careful about how far.

I've also run HELIX over an IT estate — framing security requirements,
keeping a risk register, threading a device-management rollout through
design and deploy stages. That's not software development either, and it
held up over a couple of hundred exchanges of genuinely operational work. I
won't go into specifics because it's a real organisation's security posture,
but the shape of the finding was the same: the modes and the discipline
transferred, and the friction was always about whether an artifact type
existed for the thing I had in hand.

What transfers is the staging and the handoffs — the insistence that you
frame before you design, that every finding names where it goes next, that a
decision gets recorded before a document depends on it. What doesn't
transfer automatically is the type system, because artifact types encode
what a particular kind of project needs to write down.

The useful property of trying a methodology somewhere it wasn't designed for
is that the mismatch is loud. On a software project a missing artifact type
looks like a slightly awkward document and you route around it. On dog
treats there was no lane at all, no habit to paper over it, and the gap
showed up in the first hour.
