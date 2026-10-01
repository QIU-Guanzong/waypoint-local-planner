# Waypoint local demo script

The updated 23.56-second H.264 recording is public at https://youtu.be/UmzcbjIHSDU. The source MP4 is `../../../outputs/waypoint-plan-resume-20260927/waypoint-local-plan-resume-20260927.mp4`; the raw browser capture remains local as WebM. The public video is a product demo, not a hackathon submission.

| Approx. time | On-screen action and caption |
| --- | --- |
| 0–4 sec | Start from the Saturday dinner sample and show the current finish time. |
| 4–8 sec | Change the finish time from 6:30 PM to 7:00 PM; the previously built route remains visible before applying the edit. |
| 8–12 sec | Apply the new plan locally and review its route and constraints. |
| 12–16 sec | Open the decision record and ask “Why this route?” to show the short local explanation. |
| 16–20 sec | Reload the page. The applied 7:00 PM plan returns; the prior conversation does not. |
| 20–23.56 sec | Show the local-storage note and the prototype boundary: fictional examples, no connected services, and no real-world actions. |

The browser recording uses a fictional sample and deterministic local rules. It does not demonstrate Alexa+, Amazon/AWS integration, live data, or any external service or action. The playback was made in installed Google Chrome at 1600×900 with reduced motion enabled, and the captured session had no page errors or external requests. The detailed readback is in `browser-evidence.json`.

The recording is under the event's three-minute limit and is public. The account holder still needs to review and accept the live rules and eligibility declarations, register for the hackathon, and complete the entry steps. None of those actions is represented as completed here.

## 2026-09-28 local hackathon-demo cut

The new English-captioned, 30.04-second studio-delay demonstration is stored locally at `../../../../outputs/waypoint-amazon-demo-20260928/waypoint-alexa-simulation-demo-20260928.mp4`. Its recording readback is `../../../../outputs/waypoint-amazon-demo-20260928/recording-evidence.json`; the original browser capture is retained beside it under `raw/`. This cut has not been uploaded and is not an event entry. The public 23.56-second video above remains unchanged.

| Approx. time | On-screen action and caption |
| --- | --- |
| 0–5 sec | Open the fictional studio setup and show its baseline route and 5:30 PM opening. |
| 5–13 sec | Stage a 30-minute delivery delay; show the projected 5:50 PM arrival while leaving the current route unchanged. |
| 13–23 sec | Ask what stays on time, review the decision record, and explicitly apply the proposed route. |
| 23–30 sec | Show the revised route and the prototype boundary: local rules and fictional sample, with no connected Amazon or outside service. |

The capture was made in installed Chrome against the local Vite preview at 1600×900 with reduced motion enabled. The browser readback recorded no page errors and no external requests. The video contains English captions and no recorded or synthetic voice. It does not demonstrate an Alexa+, Amazon, or AWS integration.

## 2026-10-02 MCP client walk-through

Run `pnpm demo:mcp` from the repository root. It starts the local server on an ephemeral loopback port, connects with the official TypeScript MCP client over Streamable HTTP, prints the protocol version and available tools, then requests the fictional late-delivery proposal. The command exits after closing both ends of the connection. It uses no API key, model provider, customer data, or external service; the proposal remains unapplied.

The public YouTube recording above demonstrates the web interface only; it does not show the MCP client. Before a submission that relies on the self-hosted MCP path, record a fresh public walkthrough under three minutes that shows `pnpm demo:mcp` and the source/setup boundary. No video upload or competition entry was made in this update.
