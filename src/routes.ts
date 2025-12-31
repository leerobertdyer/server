import { Router } from "express";

const router = Router();

// Simple health route for render to check periodically
// For browser health check go to {site}/health/index.html
router.get("/health", (_req, res) => res.sendStatus(200));

export default router;