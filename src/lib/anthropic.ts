import Anthropic from "@anthropic-ai/sdk";
import { getGenericTools, runTool } from "../mcp/toolRegistry";
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Maybe don't need this at all - if no tool used mcpPrompt would be same thing
export async function sendRawPrompt(message: string, systemPrompt: string) {
  const resp = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });
  return resp.content;
}

export async function mcpPrompt(
  history: Anthropic.MessageParam[],
  message: string,
) {
  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: message },
  ];

  while (true) {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages,
      tools: getGenericTools(),
    });

    if (response.stop_reason === "end_turn") {
      return response.content;
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find((b) => b.type === "tool_use");
      if (!toolUseBlock || toolUseBlock.type !== "tool_use") break;

      const result = await runTool(toolUseBlock.name, toolUseBlock.input);

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUseBlock.id,
            content: result,
          },
        ],
      });
    } else {
      // max_tokens or other stop reason
      return response.content;
    }
  }
}
