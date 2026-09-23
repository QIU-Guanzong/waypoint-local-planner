# English submission draft — review before any external use

## Project title

**Waypoint: a transparent household planning experience**

## Short description

Waypoint is a local, static prototype for a transparent agent-style household planner. Rather than hiding a recommendation behind a single answer, it shows the original goal, fixed constraints, working assumptions, route, trade-offs, and the human checkpoint before anything happens outside the product.

The current demo uses three bundled fictional scenarios: a dinner for four, a studio open house, and a weekend errand plan. A reviewer can choose a scenario, inspect each stage of the plan, reveal a decision record, and reset the local example. The experience runs without an account, API key, network call, customer data, or external model service.

## Why it is useful

Planning assistants are most useful when people can understand what was protected and what was assumed. Waypoint makes those choices inspectable. A fixed time, spending cap, shared resource, or buffer is never silently traded away; the person remains responsible for reviewing the plan and deciding whether to act.

## Technical notes

- Static Vite web application
- Vanilla JavaScript and CSS; no framework, server, analytics, or external data source
- Responsive layout, keyboard-operable controls, visible focus states, and reduced-motion support
- Fully local example data, with no account or personal-data requirement

## Demo path

1. Select a sample brief.
2. Select **Build local plan**.
3. Open the stage explanations and the decision record.
4. Review the person checkpoint and prototype boundary.

## Accurate scope statement

This is a publicly previewable static simulation, not a connected Alexa+, Amazon, or AWS implementation. It does not make reservations, purchases, messages, or other real-world actions. It has not been registered, submitted, or accompanied by an uploaded hackathon video. Any external submission must use the final live rules, eligibility criteria, intellectual-property terms, and required disclosures applicable at the time of submission.
