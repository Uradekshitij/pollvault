import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import pollsRouter from "./routes/polls.js";
import votesRouter from "./routes/votes.js";

import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/polls", pollsRouter);
app.use("/api/votes", votesRouter);

const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // serve index.html for any route not handled by the API
  // use a regular expression to avoid path-to-regexp parsing issues
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
  });
