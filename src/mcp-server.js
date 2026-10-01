import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { localhostHostValidation, localhostOriginValidation, toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod/v4";
import { previewDeliveryDelay, previewLocalPlan } from "./main.js";
import { scenarios } from "./scenarios.js";

const scenarioIds = scenarios.map(({ id }) => id);
const scenarioIdSchema = z.enum(scenarioIds);
const planOptionsSchema = z.object({
  scenarioId: scenarioIdSchema.default("dinner"),
  deadline: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  budgetCap: z.number().min(0).max(1_000_000).nullable().optional(),
  groupCount: z.number().int().min(1).max(20).nullable().optional(),
  simulateDeliveryDelay: z.boolean().optional()
});

function resultFor(value) {
  if (!value.ok) return { isError: true, content: [{ type: "text", text: value.error }] };
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value
  };
}

export function createWaypointMcpServer() {
  const server = new McpServer({ name: "waypoint-planner", version: "0.2.0" });

  server.registerTool(
    "list_planning_scenarios",
    {
      title: "List planning samples",
      description: "List Waypoint's bundled fictional planning samples and their fixed constraints. This does not read or save user data.",
      inputSchema: {}
    },
    async () => {
      const value = {
        status: "sample_data_only",
        scenarios: scenarios.map(({ id, badge, title, deadline, budgetCap, groupLabel, groupCount, constraints, outcome }) => ({
          id, badge, title, deadline, budgetCap, groupLabel, groupCount, constraints, outcome
        })),
        note: "The examples are fictional. No account, network service, calendar, map, vendor, or model provider is used."
      };
      return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], structuredContent: value };
    }
  );

  server.registerTool(
    "preview_local_plan",
    {
      title: "Preview a local plan",
      description: "Build a read-only schedule preview from a bundled sample. The result is not saved and does not make an outside change.",
      inputSchema: planOptionsSchema
    },
    async (input) => resultFor(previewLocalPlan(input))
  );

  server.registerTool(
    "preview_delivery_delay",
    {
      title: "Preview a delayed delivery",
      description: "Compare the open-house route with a 30-minute delivery delay. Returns a proposal that requires a person to review and apply in Waypoint.",
      inputSchema: z.object({
        scenarioId: scenarioIdSchema.default("open-house"),
        deadline: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        groupCount: z.number().int().min(1).max(20).nullable().optional()
      })
    },
    async (input) => resultFor(previewDeliveryDelay(input))
  );

  return server;
}

export async function startMcpServer({ host = "127.0.0.1", port = 3001 } = {}) {
  if (host !== "127.0.0.1") throw new Error("Waypoint MCP is restricted to the IPv4 loopback address 127.0.0.1.");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Port must be a whole number from 0 to 65535.");

  const handler = createMcpHandler(() => createWaypointMcpServer());
  const nodeHandler = toNodeHandler(handler);
  const validateHost = localhostHostValidation();
  const validateOrigin = localhostOriginValidation();
  const httpServer = createServer((request, response) => {
    const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    if (path !== "/mcp") {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    if (!validateHost(request, response) || !validateOrigin(request, response)) return;
    void nodeHandler(request, response);
  });

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, resolve);
  });

  const address = httpServer.address();
  if (!address || typeof address === "string") throw new Error("Could not read the MCP server address.");
  let closed = false;
  return {
    url: `http://${host}:${address.port}/mcp`,
    close: async () => {
      if (closed) return;
      closed = true;
      await new Promise((resolve, reject) => httpServer.close((error) => error ? reject(error) : resolve()));
      await handler.close();
    }
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3001);
  const running = await startMcpServer({ port });
  process.stdout.write(`Waypoint MCP endpoint listening at ${running.url}\n`);
  const shutdown = async () => {
    await running.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
