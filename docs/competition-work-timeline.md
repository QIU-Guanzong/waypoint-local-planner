# Competition work timeline

This page records source-control evidence for the Waypoint prototype. It is a provenance aid for a future review, not an assertion that the project is eligible, registered, submitted, or accepted into any event.

## Source history

| Commit | Recorded date | Scope |
| --- | --- | --- |
| `1c1f8d8` | 2026-09-23 | Created the static Waypoint planning simulation, bundled fictional scenarios, interaction tests, and draft submission material. |
| `3829d55` | 2026-09-23 | Added the MIT license for public source review. |
| `4d84efa` | 2026-09-23 | Added the GitHub Pages workflow and base-path configuration for a reviewable static preview. |
| `7ec97bd` | 2026-09-24 | Added editable planning boundaries, deadline-based route updates, stale-plan safeguards, focused interaction tests, and a local demo script. Codex was used for implementation; the running app remains deterministic and does not use a model. |
| `c0e408a` | 2026-09-24 | Added a reviewable delivery-delay simulation: the original route remains visible until applied, then the optional delivery leaves the opening path. Added focused regression tests, submission copy, and a captioned local demo video (kept outside the repository and not publicly uploaded). |
| `230ee7d` | 2026-09-27 | Saved only each sample's applied planning boundaries and disruption choice in browser storage; added validation, restoration, clearing, storage-failure handling, and focused tests. Codex assisted implementation; the app still uses deterministic local rules. Updated the local demo to show plan restoration after reload; the video remains outside the repository and is not publicly uploaded. |

## Local demo evidence

- 2026-09-28: recorded a new 30.04-second English-captioned studio-delay walkthrough to `../../../../outputs/waypoint-amazon-demo-20260928/waypoint-alexa-simulation-demo-20260928.mp4`. The capture shows the 5:30 PM opening constraint, a staged 5:50 PM delivery arrival, the unchanged route before application, and the route only changing after the explicit local apply action.
- The evidence JSON records an installed-Chrome local Vite session at 1600×900 with reduced motion, no page errors, and no external requests. The video and raw capture remain outside the repository and have not been uploaded or submitted.
- `started_at` remains 2026-09-23, supported by first commit `1c1f8d8` and the source-history table above; this new recording date is not a project-start date.
- On 2026-09-28, a read-only Chrome check of the official event page and rules confirmed the submission period is 2026-08-31 10:15 PT through 2026-10-23 12:00 PT. The project start date falls inside that period. The signed-in Devpost page still presents “Join hackathon”; the account holder has not registered or submitted.

## Disclosure boundary

- The app is a new, static prototype built during the public Amazon Developer Hackathon submission period. Git history is useful supporting evidence, not independent proof of timing, authorship, eligibility, or judging compliance.
- The source contains no Alexa+, Amazon, AWS, calendar, store, account, customer-data, or model-provider integration. The live page only uses bundled fictional examples.
- The public preview and repository do not create an entry, register an account, accept terms, upload a demo video, satisfy a runtime integration requirement, or establish any prize entitlement.
- Before any external use, the account holder must reread the current official rules and disclose prior work, third-party components, and the actual scope accurately.

## 2026-10-02 acceptance and MCP evidence

- The current official rules page shows the submission deadline as 2026-10-23 12:00 PT (2026-10-24 03:00 GMT+8) and was updated on 2026-09-16 with a minimum Alexa+ MCP version of `2025-11-25`. It also requires a public source repository and a public YouTube or Vimeo demo under three minutes.
- The signed-in Chrome page identifies the account as `QIU-Guanzong`, shows 30,108 participants, and still offers “Join hackathon”; no registration, rules acceptance, or entry was performed. Alexa+ awards are listed as USD 25,000 / 15,000 / 4,000, separate from AWS credits; they are prize amounts, not income.
- On 2026-10-02, the locked MCP SDK negotiated `2025-11-25` over the local Streamable HTTP server. Added a regression test and `pnpm demo:mcp`, which starts the server on loopback, makes real MCP tool calls with fictional samples, and shuts down without applying any action.
- `started_at` remains 2026-09-23, supported by first commit `1c1f8d8`; current protocol validation does not alter the project start date. Codex assisted this test and demo-command update.
- The current public video remains the earlier web-interface demonstration and does not show the MCP client. A matching public MCP walkthrough and account-holder rules/registration review remain before submission.
