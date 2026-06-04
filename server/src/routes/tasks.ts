import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/tasks
router.get("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if(!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        await pool.query(
            `DELETE FROM tasks
            WHERE user_id = $1
            AND due_date < CURRENT_DATE`,
            [userId]);

        const userTasks = await pool.query(
        `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        res.json(userTasks.rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
})

// POST /api/tasks
router.post("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, priority, due_date } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    try {
        const newUserTask = await pool.query(
            `INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES 
            ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, title, description, priority, due_date]
        );
        res.status(201).json(newUserTask.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
})

export default router;

// PATCH /api/tasks/:id/toggle
router.patch("/:id/toggle", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if(!id) return res.status(400).json({ error: "Could not find the Id" });

    try {
        const currentStatus = await pool.query(`
            SELECT status FROM tasks WHERE id = $1 AND user_id = $2`,
        [id, userId]);

        if(currentStatus.rows.length === 0) return res.status(404).json({ error: "Task not found" });

        const isCompleted = currentStatus.rows[0].status === 'completed';

        const result = await pool.query(`
            UPDATE tasks
            SET status = $1, completed_at = $2
            WHERE id = $3 AND user_id = $4
            RETURNING *`, 
            [ isCompleted ? 'pending' : 'completed', isCompleted ? null : new Date(), id, userId ]);

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle task" });
    }
})