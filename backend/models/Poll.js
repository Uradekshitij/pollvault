import mongoose from "mongoose";

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  creatorFingerprint: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Poll", PollSchema);
