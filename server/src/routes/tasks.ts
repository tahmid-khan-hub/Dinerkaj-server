import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/tasks
router.get("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const userTasks = await pool.query(
        `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        res.json(userTasks.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
})

