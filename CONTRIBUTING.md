# Contributing

Contributions are welcome. The course is open so that lessons, exercises, articles, and the desk around them can get better in public. A clear bug report is as useful as a patch.

Pull requests are reviewed and merged by a repository admin. For now that is the maintainer, [@adamrichardturner](https://github.com/adamrichardturner). A review from someone else does not unblock a merge.

## Before you start

Open an issue before a large pull request, especially if you are unsure whether the change fits. Small, focused changes are easier to review than a rewrite of a week.

Fork the repository and branch from `main`. Do not commit secrets. `.env` stays on your machine. The `*.example` files are the templates.

## Where to make a change

- **Lessons and exercises.** Prose, starter code, and tests are in `apps/api/src/content/week1.ts` through `week4.ts`, with shorter readings, extra exercises, and follow-up lessons applied in `expand.ts`. A lesson has more than one exercise. Include public tests that show the shape of the answer, and hidden tests for the empty, boundary, and awkward cases. Name the function the runner should call in `functionName`. Keep an existing lesson id when you extend it, and add a new id for a later step.
- **Articles.** Add an explainer with `defineArticle` in the matching file under `apps/api/src/content/articles/`, then export it from that file's list. `apps/api/src/content/articles/index.ts` already gathers those lists. One question per article, with the cost and a worked example. The site and the phone both import this module.
- **The desk.** Editor, split layout, syllabus, progress, and account screens live in `apps/web`.
- **The runner and the domain.** Submission, scoring, auth, and insights live in `apps/api/src/domain/`.

Learner-facing copy uses British spelling: _organise_, _behaviour_, _practise_ (the verb), _towards_, _labelled_. Keep the voice plain. Say what the operation costs and what it trades away.

## Code

In TypeScript, prefer a named type over `any` and over a type assertion. Return early instead of nesting conditions. Use curly braces for every `if` and `switch` case. Prefer `??` over `||` when you mean a missing value.

Before you open a pull request:

```bash
npm run typecheck
```

When you touch the runner, mail, or OAuth plan, also run:

```bash
npm test --prefix apps/api
```

## Lesson visualizations

Use a `visualization` fence containing strict JSON. Unknown fields, missing
references, duplicate node ids, out-of-range coordinates or indices, and
oversized diagrams are rejected and shown as readable source instead of
breaking the lesson.

Every visualization accepts optional `title`, `caption`, and non-negative
integer `activeStep` fields. A node, item, edge, or pointer may have
`state: "active" | "visited" | "muted"` and/or a non-negative integer `step`.
An element whose `step` equals `activeStep` is highlighted; later steps are
dimmed.

### Array

`items` contains 1–64 objects with `value` (string, finite number, or `null`).
Items can also have `label`, `state`, and `step`. `pointers` contains
`{ "label": string, "index": integer, "state"?: ..., "step"?: ... }`.
`window` has inclusive `start` and `end` indices and an optional `label`.
`showIndices` defaults to `true`.

````markdown
```visualization
{
  "type": "array",
  "title": "Binary search window",
  "caption": "Only indices 1 through 4 remain.",
  "activeStep": 2,
  "items": [
    { "value": 3, "state": "muted" },
    { "value": 8 },
    { "value": 13, "step": 2 },
    { "value": 21 },
    { "value": 34 },
    { "value": 55, "state": "muted" }
  ],
  "window": { "start": 1, "end": 4, "label": "Search range" },
  "pointers": [
    { "label": "left", "index": 1 },
    { "label": "mid", "index": 2, "step": 2 },
    { "label": "right", "index": 4 }
  ]
}
```
````

### Linked list

`nodes` contains 1–64 objects with unique string `id`, a `value`, and optional
`next` node id or `null`. `pointers` contains a `label` and a `target` node id
or `null`. All referenced ids must exist.

````markdown
```visualization
{
  "type": "linked-list",
  "title": "Advancing the current pointer",
  "activeStep": 1,
  "nodes": [
    { "id": "a", "value": 7, "next": "b", "state": "visited" },
    { "id": "b", "value": 12, "next": "c", "step": 1 },
    { "id": "c", "value": 19, "next": null }
  ],
  "pointers": [
    { "label": "head", "target": "a" },
    { "label": "current", "target": "b", "step": 1 }
  ]
}
```
````

### Tree or graph

Use `type: "graph"` for trees and general graphs. `nodes` contains 1–50 objects
with unique `id`, `label`, and `x`/`y` coordinates from 0 to 100. `edges`
contains at most 100 `{ "from": id, "to": id }` objects with optional `label`,
`state`, and `step`. `directed` defaults to `true`; set it to `false` for an
undirected graph.

````markdown
```visualization
{
  "type": "graph",
  "title": "Binary search tree",
  "caption": "Coordinates describe a responsive 0–100 canvas.",
  "activeStep": 1,
  "nodes": [
    { "id": "root", "label": "8", "x": 50, "y": 8, "step": 1 },
    { "id": "left", "label": "3", "x": 25, "y": 45 },
    { "id": "right", "label": "10", "x": 75, "y": 45 }
  ],
  "edges": [
    { "from": "root", "to": "left", "step": 1 },
    { "from": "root", "to": "right" }
  ]
}
```
````

## Pull requests

Say what changed and why. Fill in the pull request template. Keep the diff limited to the problem you are solving.

`main` does not accept direct pushes from contributors. Open a pull request instead. A new commit dismisses an earlier approval, and review comments need to be resolved before merge. Force-pushes and deletion of `main` are blocked.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
