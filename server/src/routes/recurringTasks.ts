import { Router, Request, Response } from "express";
import { pool } from "../db";


const router = Router();

// GET /api/recurring-tasks
router.get("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const getAllRecurringTasks = await pool.query(`
            SELECT * FROM recurring_tasks WHERE user_id = $1 ORDER BY created_at AT ASC`, [userId]);
        res.json(getAllRecurringTasks.rows)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurring tasks" });
    }
})

// POST /api/recurring-tasks
router.post("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, priority = "medium" } = req.body;
    if (!title?.trim())  return res.status(400).json({ error: "Title is required" });
    
    try {
        const addingNewRecurringTask = await pool.query(`
            INSERT INTO recurring_tasks (user_id, title, description, priority) VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, title, description, priority]);
        res.status(201).json(addingNewRecurringTask.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recurring tasks" });
    }
})

export default router;