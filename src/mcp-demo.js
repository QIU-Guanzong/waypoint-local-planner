import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/server";
import { startMcpServer } from "./mcp-server.js";

const server = await startMcpServer({ port: 0 });
const client = new Client({ name: "waypoint-review-demo", version: "1.0.0" });

try {
  await client.connect(new StreamableHTTPClientTransport(new URL(server.url)));

  const { tools } = await client.listTools();
  const samples = await client.callTool({ name: "list_planning_scenarios", arguments: {} });
  const delay = await client.callTool({
    name: "preview_delivery_delay",
    arguments: { scenarioId: "open-house" }
  });

  if (samples.isError || delay.isError) throw new Error("The MCP preview returned an error.");

  const proposal = delay.structuredContent;
  console.log("Waypoint MCP demo — local Streamable HTTP connection");
  console.log(`MCP protocol: ${LATEST_PROTOCOL_VERSION}`);
  console.log(`Tools: ${tools.map(({ name }) => name).join(", ")}`);
  console.log(`Fictional scenarios: ${samples.structuredContent.scenarios.map(({ title }) => title).join("; ")}`);
  console.log(`Open-house proposal: keep ${proposal.deadline} opening; delivery arrives at ${proposal.projectedArrival}.`);
  console.log(`Status: ${proposal.status}; ${proposal.note}`);
} finally {
  await client.close();
  await server.close();
}
