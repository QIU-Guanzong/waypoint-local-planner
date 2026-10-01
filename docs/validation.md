# Local validation record

Run from the repository root:

```bash
pnpm test
pnpm build
python3 /Users/c-gavin.yau/.codex/skills/web-experience-craft/scripts/audit_web_motion.py .
```

Manual browser review should cover:

- desktop and narrow viewports;
- keyboard traversal across scenario buttons, stage buttons, decision record, and reset;
- visible focus state;
- a reduced-motion environment;
- initial static content with JavaScript disabled;
- selecting a sample, editing a brief, building/updating a route, opening the decision record, changing stages, and resetting;
- a changed draft stays distinct from the last-built route until explicitly applied;
- a delivery-delay message stages a proposal, a follow-up answer carries the opening time into the next turn, and applying the proposal is the only action that replaces the built route;
- time changes use explicit AM/PM, reject times that would schedule the route into the previous day, and leave the prior route visible until application;
- unsupported or markup-like message text is displayed as text, not interpreted as HTML; changing the sample resets the conversation context;
- the latest assistant response is announced through a persistent polite live region, and focus returns to the conversation input after each turn;
- an applied plan restores after reload from browser storage; draft edits and conversation text stay out of storage, and both per-sample and full reset paths clear saved values;
- blocked or malformed browser storage leaves the planning flow usable and reports that persistence is unavailable;
- finish-time boundaries prevent a route from silently crossing into the prior day;
- a simulated delivery delay reports its projected arrival time, retains the current route until applied, then updates the route and decision record while preserving the opening time.

This file records local validation and dated external readbacks. It is not proof of a hackathon entry, account registration, service integration, award, or payment.

## 2026-09-24 review

- `pnpm test`: 15 tests passed; `pnpm build` and `git diff --check` passed.
- The advisory web-motion audit reported no findings.
- Chrome desktop playback exercised the studio sample, delayed-delivery turn, contextual follow-up, explicit apply, and decision record. No page errors occurred.
- At the time of this check, the latest captioned recording was 35.3 seconds, H.264/MP4 at 1440×900, and remained local. It had no audio track and had not been uploaded.
- A 390 px mobile review and the JavaScript-disabled static fallback were also checked; neither showed horizontal overflow or lost the static sample.

## 2026-09-27 plan-resume recording

- `outputs/waypoint-plan-resume-20260927/browser-evidence.json` records a fresh installed-Chrome session at 1600×900 with reduced motion. The session changed the dinner sample's finish time from 18:30 to 19:00, confirmed the prior route stayed visible until applying, opened the decision record, and reloaded the page.
- After reload, the applied 19:00 plan and route were restored while the conversation was absent. The visible status says draft edits and conversation text are not saved. No page errors or external network origins were observed.
- At the time of this check, the local review video was 23.56 seconds, H.264/MP4, 1600×900; the original WebM capture was retained. Neither was public or uploaded. The recording uses fictional sample data and does not connect to Alexa+, Amazon, AWS, or other services.
- This is a targeted desktop playback check, not a new mobile, keyboard, or JavaScript-disabled review. Historical checks above remain the last evidence for those paths.

## 2026-09-28 current verification

- `pnpm test`: 27 tests passed; `pnpm build` passed; the advisory web-motion audit scanned 8 source files with 0 findings.
- Chrome review of the public preview exercised the studio sample: build the plan, stage a 30-minute delivery delay, ask what stays on time, and explicitly apply the revised route. The 5:30 PM opening remained fixed, the current route stayed visible until application, and the 5:50 PM delivery remained outside the opening path. The per-sample test plan was cleared after the check.
- The public source repository's `main` SHA matches local `a1cc0307ede256c6b6f24166217966fe7baa346e`; the public preview loaded the same current flow. This was a targeted desktop path check, not a fresh mobile, keyboard, or reduced-motion run.
- The existing 23.56-second H.264 video was independently read back in YouTube Studio as **Public**; the public oEmbed endpoint returned its title. It is still a product demo, not a Devpost entry. The signed-in Devpost “My projects” page still says “Register for this hackathon,” so there is no registration, draft, or submission.

## 2026-09-28 local MCP addition

- `pnpm test`: 30 tests passed across three files. The three MCP integration tests connect an official TypeScript SDK client to an ephemeral IPv4 loopback server over Streamable HTTP, list the tools, validate a local route preview, and verify that a late-delivery proposal remains human-reviewed and unapplied.
- `pnpm build` passed. The advisory motion audit scanned 10 source files with 0 findings. `pnpm audit --prod` found no known production dependency vulnerabilities. `git diff --check` passed.
- The MCP server binds only to `127.0.0.1`, rejects a public bind address, and applies the SDK's localhost Host and Origin checks. It only reads fictional bundled scenarios; the tools do not save plans or call external services. No fresh browser visual pass was needed because this change adds no UI.
- `project.json`, the README, and this submission draft explicitly state the project start date as **2026-09-23**, supported by the first repository commit and this dated work timeline.
- This addition does not change the entry state: Devpost still requires account-holder registration/rules acceptance before an entry can be created. There is no registration or submission.

## 2026-09-28 local hackathon-demo capture

- Recorded the studio-delay path in installed Google Chrome against the local Vite preview at 1600×900 with reduced motion enabled. The fictional sample starts with a 5:30 PM opening, stages a 30-minute delivery delay and projected 5:50 PM arrival, preserves the current route until explicit application, then shows the applied route and prototype boundary.
- `../../../../outputs/waypoint-amazon-demo-20260928/recording-evidence.json` records no page errors and no external requests. The captioned, silent H.264/MP4 is 30.04 seconds at 1600×900 and remains local. The raw WebM capture is retained for provenance.
- The video does not show Alexa+, Amazon, AWS, live data, or external service integration. It has not been uploaded or submitted. The older 23.56-second public dinner-plan video remains unchanged.
- This targeted capture does not replace mobile, keyboard, static-first, or full accessibility review, and it does not establish hackathon registration or entry acceptance.
- A read-only check of the official Devpost event page and rules on 2026-09-28 showed the submission window as 2026-08-31 10:15 PT through 2026-10-23 12:00 PT (2026-10-24 03:00 GMT+8). The Alexa+ rules expressly permit a simulated web-app experience using an agentic tool without a required framework or SDK. The signed-in page still offers “Join hackathon”; no registration or submission was made.
- The project `started_at` date, 2026-09-23, is within that published window and remains supported by its first repository commit and the dated timeline. This date check does not make the entrant's eligibility or eventual award status automatic.
- The official Alexa+ prizes list USD 25,000, USD 15,000, and USD 4,000 cash awards, separately from AWS credits. Prize awards are not income. The rules require post-award identity/role verification and other forms, and may require a W-8BEN for non-US winners; a Hong Kong payout method has not been verified.

## 2026-10-02 MCP protocol acceptance

- The 2026-09-16 official rules update sets `2025-11-25` as the minimum Alexa+ MCP version and requires a public source repository plus a public YouTube or Vimeo demo under three minutes. The authenticated event page in Chrome shows `QIU-Guanzong`, “Join hackathon,” 30,108 participants, and a 2026-10-24 03:00 GMT+8 deadline. No rules acceptance, registration, or entry was made.
- `pnpm install --frozen-lockfile --ignore-scripts` found the lockfile current and reused 105 cached packages (0 downloaded). `pnpm test` passed 31 tests across 3 files; `pnpm build` passed; `git diff --check` passed.
- `pnpm demo:mcp` started an ephemeral 127.0.0.1 server, connected an official MCP client through Streamable HTTP, printed protocol `2025-11-25`, listed three read-only tools, and returned the fictional open-house proposal as `requires_human_review`. It made no outside request and applied no action.
- The regression test captures the actual initialization request and checks the minimum protocol version. The project remains a local self-hosted MCP service plus a static simulation; it is not an Amazon/Alexa+ integration.
- The public YouTube video is still web-UI-only. No new recording or upload was created. A separate public MCP demonstration video and account-holder registration/rules review remain necessary before entry.
