import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // income/expense
    amount: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
