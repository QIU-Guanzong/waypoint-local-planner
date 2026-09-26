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

This file records local validation only. It is not proof of a hackathon entry, account registration, video upload, service integration, award, or payment.

## 2026-09-24 review

- `pnpm test`: 15 tests passed; `pnpm build` and `git diff --check` passed.
- The advisory web-motion audit reported no findings.
- Chrome desktop playback exercised the studio sample, delayed-delivery turn, contextual follow-up, explicit apply, and decision record. No page errors occurred.
- The latest captioned recording is 35.3 seconds, H.264/MP4 at 1440×900, and remains local. It has no audio track and has not been uploaded.
- A 390 px mobile review and the JavaScript-disabled static fallback were also checked; neither showed horizontal overflow or lost the static sample.

## 2026-09-27 plan-resume recording

- `outputs/waypoint-plan-resume-20260927/browser-evidence.json` records a fresh installed-Chrome session at 1600×900 with reduced motion. The session changed the dinner sample's finish time from 18:30 to 19:00, confirmed the prior route stayed visible until applying, opened the decision record, and reloaded the page.
- After reload, the applied 19:00 plan and route were restored while the conversation was absent. The visible status says draft edits and conversation text are not saved. No page errors or external network origins were observed.
- The local review video is 23.56 seconds, H.264/MP4, 1600×900; the original WebM capture is retained. Neither is public or uploaded. The recording uses fictional sample data and does not connect to Alexa+, Amazon, AWS, or other services.
- This is a targeted desktop playback check, not a new mobile, keyboard, or JavaScript-disabled review. Historical checks above remain the last evidence for those paths.
