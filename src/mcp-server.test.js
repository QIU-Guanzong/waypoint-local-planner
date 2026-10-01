import { afterEach, describe, expect, it } from "vitest";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { startMcpServer } from "./mcp-server.js";

describe("Waypoint MCP over Streamable HTTP", () => {
  let server;
  let client;

  afterEach(async () => {
    await client?.close();
    await server?.close();
    client = undefined;
    server = undefined;
  });

  it("lists samples and returns a delivery proposal without applying it", async () => {
    server = await startMcpServer({ port: 0 });
    client = new Client({ name: "waypoint-test-client", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(server.url)));

    const { tools } = await client.listTools();
    expect(tools.map(({ name }) => name)).toEqual([
      "list_planning_scenarios",
      "preview_local_plan",
      "preview_delivery_delay"
    ]);
    expect(tools.some(({ name }) => /apply|purchase|send|reserve/i.test(name))).toBe(false);

    const samples = await client.callTool({ name: "list_planning_scenarios", arguments: {} });
    expect(samples.structuredContent.scenarios.map(({ id }) => id)).toEqual(["dinner", "open-house", "weekend"]);

    const result = await client.callTool({
      name: "preview_delivery_delay",
      arguments: { scenarioId: "open-house" }
    });
    const proposal = result.structuredContent;
    expect(proposal.status).toBe("requires_human_review");
    expect(proposal.deadline).toBe("5:30 PM");
    expect(proposal.projectedArrival).toBe("5:50 PM");
    expect(proposal.currentRoute[2].title).toBe("Absorb the late delivery");
    expect(proposal.proposedRoute[2].title).toBe("Keep the opening path clear");
    expect(proposal.note).toContain("person must review and apply");
  });

  it("negotiates the MCP version required by the Alexa+ track", async () => {
    server = await startMcpServer({ port: 0 });
    const initializationVersions = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init = {}) => {
      if (typeof init.body === "string") {
        try {
          const request = JSON.parse(init.body);
          if (request.method === "initialize") initializationVersions.push(request.params.protocolVersion);
        } catch {}
      }
      return originalFetch(input, init);
    };

    try {
      client = new Client({ name: "waypoint-track-version-test", version: "1.0.0" });
      await client.connect(new StreamableHTTPClientTransport(new URL(server.url)));
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(initializationVersions).toContain("2025-11-25");
  });

  it("rejects a schedule that crosses the sample's earliest start", async () => {
    server = await startMcpServer({ port: 0 });
    client = new Client({ name: "waypoint-test-client", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(server.url)));

    const result = await client.callTool({
      name: "preview_local_plan",
      arguments: { scenarioId: "dinner", deadline: "01:00" }
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("no earlier than 2:15 AM");
  });

  it("binds only to the IPv4 loopback interface", async () => {
    await expect(startMcpServer({ host: "0.0.0.0", port: 0 })).rejects.toThrow("restricted to the IPv4 loopback");
  });
});
