# Contributing

Contributions are welcome. The course is open so that lessons, exercises, articles, and the desk around them can get better in public. A clear bug report is as useful as a patch.

Pull requests are reviewed and merged by a repository admin. For now that is the maintainer, [@adamrichardturner](https://github.com/adamrichardturner). A review from someone else does not unblock a merge.

## Before you start

Open an issue before a large pull request, especially if you are unsure whether the change fits. Small, focused changes are easier to review than a rewrite of a week.

Fork the repository and branch from `main`. Do not commit secrets. `.env` stays on your machine. The `*.example` files are the templates.

## Where to make a change

- **Lessons and exercises.** Prose, starter code, and tests are in `apps/api/src/content/week1.ts` through `week4.ts`, with shorter readings, extra exercises, and follow-up lessons applied in `expand.ts`. A lesson has more than one exercise. Include public tests that show the shape of the answer, and hidden tests for the empty, boundary, and awkward cases. Name the function the runner should call in `functionName`. Keep an existing lesson id when you extend it, and add a new id for a later step.
- **Articles.** Add an explainer with `defineArticle` in the matching file under `apps/web/lib/articles/`, then export it from that file's list. `apps/web/lib/articles/index.ts` already gathers those lists. One question per article, with the cost and a worked example.
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

## Pull requests

Say what changed and why. Fill in the pull request template. Keep the diff limited to the problem you are solving.

`main` does not accept direct pushes from contributors. Open a pull request instead. A new commit dismisses an earlier approval, and review comments need to be resolved before merge. Force-pushes and deletion of `main` are blocked.

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
