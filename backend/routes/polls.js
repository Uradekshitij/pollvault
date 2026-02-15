import express from "express";
import mongoose from "mongoose";
import Poll from "../models/Poll.js";
import PollOption from "../models/PollOption.js";
import Vote from "../models/Vote.js";

const router = express.Router();

// list all polls (for home page)
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().lean();
    res.json({ polls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create a new poll with options
router.post("/", async (req, res) => {
  try {
    const { question, options, creatorFingerprint } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2 || !creatorFingerprint) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const poll = await Poll.create({ question, creatorFingerprint });
    const optionDocs = options.map((label, idx) => ({
      poll_id: poll._id,
      label,
      position: idx,
    }));
    await PollOption.insertMany(optionDocs);

    res.status(201).json({ poll });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// fetch poll and its options
router.get("/:id", async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).lean();
    if (!poll) return res.status(404).json({ error: "Not found" });

    const options = await PollOption.find({ poll_id: poll._id })
      .sort("position")
      .lean();
    res.json({ poll, options });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete poll (only creator can)
router.delete("/:id", async (req, res) => {
  try {
    const { fingerprint, adminKey } = req.body || {};
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: "Not found" });

    // allow deletion if fingerprint matches creator
    let allowed = false;
    if (fingerprint && poll.creatorFingerprint === fingerprint) {
      allowed = true;
    }

    // or if administrator key provided and valid
    if (!allowed && adminKey && adminKey === process.env.ADMIN_KEY) {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await Poll.deleteOne({ _id: poll._id });
    await PollOption.deleteMany({ poll_id: poll._id });
    await Vote.deleteMany({ poll_id: poll._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// vote counts for a poll
router.get("/:id/votes", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid poll id" });
    }
    const votes = await Vote.aggregate([
      { $match: { poll_id: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$option_id", count: { $sum: 1 } } },
    ]);
    res.json({ votes });
  } catch (err) {
    console.error("votes aggregation error", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
