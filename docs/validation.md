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
- finish-time boundaries prevent a route from silently crossing into the prior day;
- a simulated delivery delay reports its projected arrival time, retains the current route until applied, then updates the route and decision record while preserving the opening time.

This file records local validation only. It is not proof of a hackathon entry, account registration, video upload, service integration, award, or payment.
