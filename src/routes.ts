import { Router } from "express";
import pool from "./db";

const router = Router();

// Check status of server && db
router.get("/", (_req, res) => {
    try {
        console.log("Attempting to connect to pgdb with internal string")
        pool.query("SELECT NOW()", (err, dbResp) => {
            if (err) {
                console.error(`Error querying db: ${err}`)
            } else {
                console.log(`Raw response: ${dbResp}`)
                res.status(301);
                res.redirect("/pages/status/index.html")
            }
        })
    } catch (err) {
        console.error(`Error getting server status: ${err}`)
    }
});

// Simple health route for render to check periodically
// For browser health check go to {site}/health/index.html
router.get("/health", (_req, res) => res.sendStatus(200));

export default router;