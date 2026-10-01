# Waypoint — local agent-style planning simulation

Waypoint is a static Vite prototype for an **Alexa+ alternative-path hackathon concept**. It demonstrates a household planning experience that keeps the goal, constraints, assumptions, sequence, trade-offs, and human checkpoint visible.

It is designed for local review and has a static public preview. The three examples are fictional and use bundled data only:

- a dinner plan for four;
- a studio open-house setup;
- a weekend reset with shared errands.

**Project start date:** 2026-09-23. The date is recorded in [`project.json`](project.json) and supported by the first repository commit and the dated work timeline.

## What this prototype does

- renders an accessible, responsive planning workspace;
- lets a reviewer choose a sample household brief and adjust its finish time, optional spending cap, and group size where relevant;
- schedules the sample route backward from the chosen finish time and keeps the previous route visible until the reviewer applies the edited brief;
- simulates a late studio delivery and replans only the optional step, keeping the opening time fixed until the person applies the change;
- carries a short text conversation across a proposed delay, an explanation of what stays fixed, and a direct local apply action;
- restores the last applied plan for each sample after a reload, storing only its finish time, optional cap, group count, and applied delay in this browser; draft edits and conversation text are not stored, and the saved plan can be cleared;
- exposes the assumptions and human checkpoint in a decision record;
- shows a clear local-only status and a final human checkpoint;
- the static web experience works without accounts, credentials, API keys, external network calls, customer data, or a model provider.

An optional local MCP endpoint is available for tool-client review. It uses the official TypeScript SDK over Streamable HTTP, listens only on `127.0.0.1`, and exposes three read-only tools for listing fictional samples and previewing a plan or delivery-delay proposal. It does not save plans or contact outside services. The static web app itself makes no network calls.

The route generator and phrase matcher are deterministic and local. The conversation handles a small, visible set of example intents; it is not a general language model or an Alexa+ connection. The spending cap is carried through the plan as a user boundary; the prototype does not estimate costs or check live prices.

## What it does **not** do

This repository is a simulation only. It has **not** been registered for or submitted to an Amazon Developer Hackathon. A 23.56-second product-demo video is public at [YouTube](https://youtu.be/UmzcbjIHSDU); the video does not constitute a hackathon entry. The project has no Alexa+, Amazon, AWS, store, calendar, maps, reservation, checkout, or real customer-data integration. It cannot make a purchase, contact a service, send a message, or complete any real-world action.

“Alexa+” appears only to describe the prospective hackathon context. This project is not affiliated with, endorsed by, or connected to Amazon. Before any registration or submission, the account holder must review the live hackathon rules, eligibility, intellectual-property terms, permitted AI use, privacy requirements, and submission format.

## Live preview

[Open the static Waypoint preview](https://qiu-guanzong.github.io/waypoint-local-planner/). It has been checked without an account or service connection. A public preview and demo video are not a hackathon registration, submission, connected Alexa+ implementation, or award.

## License

[MIT](LICENSE)

## Run locally

```bash
pnpm install
pnpm dev
```

Then open the local address printed by Vite. No environment variables are required.

To run the optional local MCP endpoint in a second terminal:

```bash
pnpm mcp
```

The endpoint is `http://127.0.0.1:3001/mcp`. It is restricted to IPv4 loopback, uses the SDK's localhost host and origin checks, and cannot be bound to a public interface. The included integration tests connect through the MCP client SDK on an ephemeral loopback port.

To see a real client connect over Streamable HTTP, list the available tools, and request the fictional late-delivery preview:

```bash
pnpm demo:mcp
```

The demo starts the server on a temporary loopback port and shuts it down when finished. It uses only bundled sample data; the proposal remains unapplied.

## Verify

```bash
pnpm test
pnpm build
python3 /Users/c-gavin.yau/.codex/skills/web-experience-craft/scripts/audit_web_motion.py .
```

The implementation uses CSS-only press/hover feedback, preserves keyboard focus, supplies a static initial document, and disables non-essential motion under `prefers-reduced-motion`.

## Review path

1. Select **Open the studio on time** and build its initial local route.
2. Ask, **“The delivery is 30 minutes late.”** Waypoint stages a proposal and keeps the current route visible.
3. Ask, **“What stays on time?”** The reply carries the studio opening deadline into the next turn and explains the projected arrival.
4. Select **Apply the revised route**. The optional delivery moves outside the opening path; no outside action is taken.
5. Open the stage explanations and decision record. The assumption, changed route, and person checkpoint stay visible.
6. Reload the page and choose the studio sample again to see the applied plan restored. The conversation text is absent because it is not saved.
7. Clear the saved plan for that sample or use **Reset demo & clear saved plans**. Review the **Prototype boundary**; no vendor or order is contacted.

The copyable English submission draft is in [docs/submission-draft.md](docs/submission-draft.md). A local demo script is in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md). Validation notes are in [docs/validation.md](docs/validation.md). The source-control disclosure is in [docs/competition-work-timeline.md](docs/competition-work-timeline.md).
