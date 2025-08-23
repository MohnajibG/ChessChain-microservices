import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  stake: { type: Number, required: true }, // 10, 25, 50
  roomId: { type: String },
  player1: { type: String, required: true },
  player2: { type: String, default: null },
  status: { type: String, default: "waiting" }, // waiting | ready | finished
  winner: { type: String, default: null },
  txHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Auto roomId = _id si absent
GameSchema.pre("save", function (next) {
  if (!this.roomId) this.roomId = this._id.toString();
  next();
});

export default mongoose.model("Game", GameSchema);
