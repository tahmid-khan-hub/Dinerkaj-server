/// <reference path="./types/express.d.ts" />
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import tasksRouter from "./routes/tasks";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Better Auth, before session middleware
app.all("/api/auth/*splat", toNodeHandler(auth));

// session middleware, attaches user to every request
app.use(async(req, res, next) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    })
    req.user = session?.user ?? null;
    next();
}) 

// tasks api
app.use("/api/tasks", tasksRouter);

app.get("/", (req, res) => {
    res.json({ message: "Dinerkaj server running" });
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT} port`);
})
