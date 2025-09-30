import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    roi: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);
