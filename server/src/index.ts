import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Better Auth 
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
    res.json({ message: "Dinerkaj server running" });
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT} port`);
})
