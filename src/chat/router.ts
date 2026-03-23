import { NextFunction, Request, Response, Router } from "express";
import { mcpPrompt } from "../lib/anthropic";

const router = Router();

function checkForApiKey(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-chat-api-secret"] !== process.env.CHAT_API_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

router.use(checkForApiKey);

router.post("/", async (req, res) => {
  const { message, history } = req.body;
  const response = await mcpPrompt(history, message);

  res.json({ reply: response });
});

export default router;
