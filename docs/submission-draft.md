# English submission draft — review before any external use

## Project title

**Waypoint: a transparent household planning experience**

## Short description

Waypoint is a local, static prototype for a transparent household planning assistant. A reviewer can choose a dinner, studio setup, or weekend-errand brief; adjust its finish time, optional spending cap, and group size where relevant; and build a visible route around those boundaries. Editing an input changes the brief summary immediately, while the previous route remains in place until the reviewer applies the update.

The local rule-based simulation schedules sample steps backward from the chosen finish time and records the brief, assumptions, route, and human checkpoint. It uses fictional examples and makes no network, account, API-key, customer-data, or external model-service calls. A spending cap remains a planning boundary; the prototype does not estimate costs or check live prices.

## Why it is useful

Planning assistants are most useful when people can understand what was protected and what was assumed. Waypoint makes those choices inspectable. A fixed time, spending cap, shared resource, or buffer is never silently traded away; the person remains responsible for reviewing the plan and deciding whether to act.

## Technical notes

- Static Vite web application
- Vanilla JavaScript and CSS; no framework, server, analytics, or external data source
- Responsive layout, keyboard-operable controls, visible focus states, and reduced-motion support
- Deterministic local rules and bundled fictional examples; no account or personal-data requirement

## Demo path

1. Select a sample brief.
2. Select **Build local plan** to see its first route.
3. Change the finish time, optional spending cap, or group size, then confirm the old route remains until **Update local plan** is selected.
4. Open the stage explanations and decision record, then review the person checkpoint and prototype boundary.

## Demo video

A 21.7-second, captioned local browser recording is prepared in the workspace's sibling `outputs` directory, outside this repository. It is a local review file only and has not been uploaded to Devpost or another public service. The matching sequence is documented in [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md).

## Development disclosure

OpenAI Codex was used as a coding agent to implement and test this prototype. The running app uses deterministic local rules and does not call an AI model or external service.

## Accurate scope statement

This is a publicly previewable static simulation, not a connected Alexa+, Amazon, or AWS implementation. It does not make reservations, purchases, messages, or other real-world actions. It has not been registered or submitted. Any external submission must use the final live rules, eligibility criteria, intellectual-property terms, and required disclosures applicable at the time of submission.
