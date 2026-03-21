import { Router } from "express";
import { mcpPrompt } from "../lib/anthropic";

const router = Router();

router.post("/", async (req, res) => {
  const { message, history } = req.body;
  const response = await mcpPrompt(history, message);

  res.json({ reply: response });
});

export default router
