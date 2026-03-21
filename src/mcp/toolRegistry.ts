// toolRegistry.ts
import Anthropic from "@anthropic-ai/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type Tool = {
  name: string;
  description: string;
  input_schema: Anthropic.Tool['input_schema'];
  handler: (input: any) => Promise<any>;
};

export const genericTools: Tool[] = [
  {
    name: "tell_me_a_secret",
    description: "Retrieve a secret to prove the mcp server is working",
    input_schema: { type: "object", properties: {} },
    handler: async () => "LEEEEEEEBOY JENKINS!!!!!!!",
  },
  // add more tools here
];

// For later... maybe:
// export const musicTools: Tool[] = [];
// export const portfolioTools: Tool[] = [];

export function registerTools(server: McpServer) {
  for (const tool of genericTools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: undefined },
      async (input) => ({
        content: [{ type: "text", text: await tool.handler(input) }],
      })
    );
  }
}

export function getGenericTools() {
  return genericTools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}

// later: getMusicTools() {...}

export async function runTool(name: string, input: any): Promise<string> {
  const tool = genericTools.find(t => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await tool.handler(input);
}
