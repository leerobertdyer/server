import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { registerTools } from "./toolRegistry";

const router = Router();

const transports = new Map<string, StreamableHTTPServerTransport>();

function createServer() {
  const server = new McpServer({ name: "leedyer-mcp", version: "1.0.0" });
  registerTools(server);
  return server;
}

router.all("/", async (req: Request, res: Response) => {
  let transport: StreamableHTTPServerTransport;
  const sessionId = req.headers["mcp-session-id"] as string;
  console.log("incoming sessionId header:", sessionId);
  console.log("known sessions:", Array.from(transports.keys()));

  if (sessionId && transports.has(sessionId)) {
    transport = transports.get(sessionId)!;
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    if (transport.sessionId) {
      transports.set(transport.sessionId, transport);
    }
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

export default router;
