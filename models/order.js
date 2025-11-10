import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  username: String,
  phone: String,
  quantity: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
