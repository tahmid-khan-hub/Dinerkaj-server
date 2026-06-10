import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

router.post("/", async(req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { notesTitle, category, notesDescription } = req.body;
    if (!notesTitle) return res.status(400).json({ error: "Notes title is required" });

    try {
        const newNote = await pool.query(`
            INSERT INTO notes (user_id, notesTitle, category, notesDescription) VALUES ($1, $2, $3, $4) RETURNING *`, [userId, notesTitle, category, notesDescription]);
        res.status(201).json(newNote.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create new note" });
    }
})

export default router;