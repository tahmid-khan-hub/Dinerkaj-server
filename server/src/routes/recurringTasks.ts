import { Router, Request, Response } from "express";
import { pool } from "../db";


const router = Router();

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

export default router;