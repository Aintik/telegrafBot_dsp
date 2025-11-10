const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  username: String,
  phone: String,
  quantity: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
