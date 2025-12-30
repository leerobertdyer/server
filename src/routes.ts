import { Router } from "express";
import pool from "./db";

const router = Router();

router.get("/", (_req, res) => {
    try {
        console.log("Attempting to connect to pgdb with internal string")
        pool.query("SELECT NOW()", (err, dbResp) => {
            if (err) {
                console.error(`Error querying db: ${err}`)
            } else {
                console.log(`Raw response: ${dbResp}`)
                res.status(200);
                res.sendFile("/pages/status/index.html")
            }
        })
    } catch (err) {
        console.error(`Error getting server status: ${err}`)
    }
});

export default router;