import express from "express";
import mongoose from "mongoose";
import Poll from "../models/Poll.js";
import PollOption from "../models/PollOption.js";
import Vote from "../models/Vote.js";

const router = express.Router();

/**
 * GET /api/polls
 * List all polls
 */
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().lean();
    return res.json({ polls });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch polls",
      error: err.message,
    });
  }
});

/**
 * POST /api/polls
 * Create a new poll with options
 */
router.post("/", async (req, res) => {
  try {
    const { question, options, creatorFingerprint } = req.body;

    // validation
    if (
      typeof question !== "string" ||
      !Array.isArray(options) ||
      options.length < 2 ||
      !creatorFingerprint
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload",
      });
    }

    const poll = await Poll.create({
      question,
      creatorFingerprint,
    });

    const optionDocs = options.map((label, index) => ({
      poll_id: poll._id,
      label,
      position: index,
    }));

    await PollOption.insertMany(optionDocs);

    return res.status(201).json({
      success: true,
      poll,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to create poll",
      error: err.message,
    });
  }
});

/**
 * GET /api/polls/:id
 * Fetch a poll with options
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll id",
      });
    }

    const poll = await Poll.findById(id).lean();
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    const options = await PollOption.find({ poll_id: poll._id })
      .sort("position")
      .lean();

    return res.json({
      success: true,
      poll,
      options,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch poll",
      error: err.message,
    });
  }
});

/**
 * DELETE /api/polls/:id
 * Delete poll (creator or admin only)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { fingerprint, adminKey } = req.body || {};
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll id",
      });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    let allowed = false;

    if (fingerprint && poll.creatorFingerprint === fingerprint) {
      allowed = true;
    }

    if (!allowed && adminKey && adminKey === process.env.ADMIN_KEY) {
      allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete poll",
      });
    }

    await Poll.deleteOne({ _id: poll._id });
    await PollOption.deleteMany({ poll_id: poll._id });
    await Vote.deleteMany({ poll_id: poll._id });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete poll",
      error: err.message,
    });
  }
});

/**
 * GET /api/polls/:id/votes
 * Get vote counts
 */
router.get("/:id/votes", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll id",
      });
    }

    const votes = await Vote.aggregate([
      { $match: { poll_id: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$option_id", count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      votes,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch votes",
      error: err.message,
    });
  }
});

export default router;
