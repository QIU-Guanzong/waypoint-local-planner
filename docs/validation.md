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
- selection, build, trace, and reset states.

This file records local validation only. It is not proof of a hackathon entry, account registration, video upload, service integration, award, or payment.
