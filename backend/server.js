import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import pollsRouter from "./routes/polls.js";
import votesRouter from "./routes/votes.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// API routes
app.use("/api/polls", pollsRouter);
app.use("/api/votes", votesRouter);

app.options("*", cors());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });
