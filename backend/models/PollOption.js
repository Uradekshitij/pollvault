import mongoose from "mongoose";

const PollOptionSchema = new mongoose.Schema({
  poll_id: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  label: { type: String, required: true },
  position: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("PollOption", PollOptionSchema);
