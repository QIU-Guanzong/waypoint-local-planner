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
- finish-time boundaries prevent a route from silently crossing into the prior day;
- a simulated delivery delay reports its projected arrival time, retains the current route until applied, then updates the route and decision record while preserving the opening time.

This file records local validation only. It is not proof of a hackathon entry, account registration, video upload, service integration, award, or payment.

## 2026-09-24 review

- `pnpm test`: 15 tests passed; `pnpm build` and `git diff --check` passed.
- The advisory web-motion audit reported no findings.
- Chrome desktop playback exercised the studio sample, delayed-delivery turn, contextual follow-up, explicit apply, and decision record. No page errors occurred.
- The latest captioned recording is 35.3 seconds, H.264/MP4 at 1440×900, and remains local. It has no audio track and has not been uploaded.
- A 390 px mobile review and the JavaScript-disabled static fallback were also checked; neither showed horizontal overflow or lost the static sample.
