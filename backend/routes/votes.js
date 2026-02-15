import express from "express";
import Vote from "../models/Vote.js";

const router = express.Router();

// add a vote for a poll
router.post("/:pollId", async (req, res) => {
  try {
    const { option_id, voter_fingerprint } = req.body;
    const voter_ip = req.ip;

    const vote = new Vote({
      poll_id: req.params.pollId,
      option_id,
      voter_fingerprint,
      voter_ip,
    });

    await vote.save();
    res.status(201).json({ vote });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate vote
      return res.status(409).json({ error: "Already voted" });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
