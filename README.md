# Waypoint — local agent-style planning simulation

Waypoint is a small, static Vite prototype for an **Alexa+ alternative-path hackathon concept**. It demonstrates a household planning experience that keeps the goal, constraints, assumptions, sequence, trade-offs, and human checkpoint visible.

It is designed for local review and has a static public preview. The three examples are fictional and use bundled data only:

- a dinner plan for four;
- a studio open-house setup;
- a weekend reset with shared errands.

## What this prototype does

- renders an accessible, responsive planning workspace;
- lets a reviewer select a sample brief, inspect each decision stage, assemble a local example plan, and reveal its decision record;
- shows a clear local-only status and a final human checkpoint;
- works without accounts, credentials, API keys, network calls, customer data, or a model provider.

## What it does **not** do

This repository is a simulation only. It has **not** been registered for or submitted to an Amazon Developer Hackathon. No video has been uploaded. It has no Alexa+, Amazon, AWS, Nightly, store, calendar, maps, reservation, checkout, or real customer-data integration. It cannot make a purchase, contact a service, send a message, or complete any real-world action.

“Alexa+” appears only to describe the prospective hackathon context. This project is not affiliated with, endorsed by, or connected to Amazon. Before any registration or submission, the account holder must review the live hackathon rules, eligibility, intellectual-property terms, permitted AI use, privacy requirements, and submission format.

## Live preview

[Open the static Waypoint preview](https://qiu-guanzong.github.io/waypoint-local-planner/). It has been checked without an account or service connection. A public preview is not a hackathon registration, submission, uploaded video, connected Alexa+ implementation, or award.

## License

[MIT](LICENSE)

## Run locally

```bash
pnpm install
pnpm dev
```

Then open the local address printed by Vite. No environment variables are required.

## Verify

```bash
pnpm test
pnpm build
python3 /Users/c-gavin.yau/.codex/skills/web-experience-craft/scripts/audit_web_motion.py .
```

The implementation uses CSS-only press/hover feedback, preserves keyboard focus, supplies a static initial document, and disables non-essential motion under `prefers-reduced-motion`.

## Review path

1. Pick one of the sample briefs under **01 / Select a brief**.
2. Select **Build local plan**. The app labels this honestly as an in-browser example; it never sends a request.
3. Select a stage to read the rationale, then select **Show decision record**.
4. Review the **Prototype boundary** and final person checkpoint.

The copyable English submission draft is in [docs/submission-draft.md](docs/submission-draft.md). Validation notes are in [docs/validation.md](docs/validation.md). The source-control disclosure is in [docs/competition-work-timeline.md](docs/competition-work-timeline.md).
