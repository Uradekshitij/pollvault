import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  poll_id: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  option_id: { type: mongoose.Schema.Types.ObjectId, ref: "PollOption", required: true },
  voter_fingerprint: { type: String, required: true },
  voter_ip: { type: String },
  created_at: { type: Date, default: Date.now },
});

// enforce one vote per fingerprint per poll
VoteSchema.index({ poll_id: 1, voter_fingerprint: 1 }, { unique: true });

export default mongoose.model("Vote", VoteSchema);
