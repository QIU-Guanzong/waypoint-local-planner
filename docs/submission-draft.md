# English submission draft — review before any external use

## Project title

**Waypoint: a household plan that stays on time when a delivery slips**

## Short description

Waypoint is a local, static simulation of a household planning assistant. It turns a dinner, studio setup, or weekend-errand brief into a visible route around a fixed finish time, optional spending cap, and group size. In the studio scenario, a 30-minute delivery delay would put the delivery after opening; the person can inspect the proposed response before applying it, and the opening route stays ready while the optional delivery moves outside the critical path.

The local rule-based simulation schedules sample steps backward from the chosen finish time and records the brief, assumptions, route, and person checkpoint. In the studio example, a short, bounded text conversation can stage a delayed delivery, answer what stays on time, and apply a revised route only when the person asks. It uses fictional examples and makes no network, account, API-key, customer-data, or external model-service calls. A spending cap remains a planning boundary; the prototype does not estimate costs or check live prices.

## Why it is useful

Planning assistants are most useful when people can see what changed and what stayed protected. Waypoint shows the original route, the proposed response, and the decision record before the change is applied. The person keeps control of any action outside the simulation.

## Technical notes

- Static Vite web application
- Vanilla JavaScript and CSS; no framework, server, analytics, or external data source
- Responsive layout, keyboard-operable controls, visible focus states, and reduced-motion support
- One deterministic disruption scenario: a simulated late delivery is deferred so the studio opening remains on time
- A bounded phrase matcher carries the selected brief across a few text turns; unsupported requests get a clear limitation rather than an invented answer
- Deterministic local rules and bundled fictional examples; no account or personal-data requirement

## Demo path

1. Choose **Open the studio on time** and select **Build local plan**.
2. Review the arrival path, helper split, and planned delivery step.
3. Ask, **“The delivery is 30 minutes late.”** Confirm Waypoint stages a proposal while the previous route stays visible.
4. Ask, **“What stays on time?”** Confirm the answer keeps the 5:30 PM opening in context and estimates the 5:50 PM delivery.
5. Select **Apply the revised route**. The new local route keeps the room ready and leaves the optional delivery outside the opening path.
6. Open the handoff stage and decision record, then review the person checkpoint and local-only boundary.

## Demo video

A captioned local browser recording is prepared in the workspace's sibling `outputs` directory, outside this repository. It is a local review file only and has not been uploaded to Devpost or another public service. The matching sequence is documented in [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md).

## Development disclosure

OpenAI Codex was used as a coding agent to implement and test this prototype. The running app uses deterministic local rules and does not call an AI model or external service.

## Product feedback (draft)

- **Amazon tools, APIs, and SDKs used:** None at runtime. This entry uses the rules' simulated Alexa+ web-experience path. The prototype was built with Vite, vanilla JavaScript/CSS, and OpenAI Codex as a coding agent.
- **What worked:** The public rules and participant FAQ clearly describe a simulated experience path, so the project can show a complete local flow without partner-only runtime access.
- **What needs work:** The participant FAQ says the Alexa+ add-on developer tools are partner-gated and that hackathon participants cannot request access. That leaves no public way to test Alexa+ runtime behavior in this entry.
- **Onboarding:** We reviewed the rules and FAQ and built the permitted simulation. We did not attempt partner enrollment or test gated tools.
- **Would we build with it again?** Yes for the documented simulation path. A self-service runtime sandbox would make it possible to evaluate real Alexa+ integration.

## Track selection (draft)

- **Primary track:** Alexa+ — simulated web experience.
- **Mini challenge:** Open Source — a separate public Atuin contribution made during the hackathon window.

### Open Source mini-challenge fields

- **Contribution:** https://github.com/atuinsh/atuin/pull/4200
- **Repository:** https://github.com/atuinsh/atuin
- **GitHub username:** QIU-Guanzong
- **Work:** Preserve a user's custom matcher and handler settings when Atuin updates existing AI-agent hooks. The change groups hook registration behavior in a small type and has focused tests. The pull request was created during the hackathon window and is open; no maintainer review decision or merge is recorded, so do not describe it as accepted.

## Friction log (draft)

- **Task attempted:** Find a participant self-service path for testing Alexa+ add-on developer tools.
- **Steps:** Read the official hackathon rules and participant FAQ sections on Alexa+ tools and the simulated web path.
- **Expected vs. actual:** Expected a public sandbox or request-access path; the FAQ says the tools are partner-only and hackathon participants cannot request access. The rules do allow the simulated experience path.
- **Severity:** Medium — full Alexa+ runtime behavior cannot be tested through the public participant path.
- **Workaround:** Use the documented simulation path and state clearly that there is no Alexa+ runtime integration.
- **Actionable suggestion:** Provide a temporary sandbox or a self-service developer-access process for hackathon participants.
- **Scope:** This entry is based on the published rules and FAQ; no partner enrollment or runtime onboarding was attempted.

## Accurate scope statement

This is a publicly previewable static simulation, not a connected Alexa+, Amazon, or AWS implementation. It does not make reservations, purchases, messages, or other real-world actions. It has not been registered or submitted. Any external submission must use the final live rules, eligibility criteria, intellectual-property terms, and required disclosures applicable at the time of submission. Monetary prizes are competitive and not guaranteed; prize verification, tax forms, and the actual payment route remain for the account holder to review and handle personally.
