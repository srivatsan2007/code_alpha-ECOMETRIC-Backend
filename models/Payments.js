const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  transactionId: String,
  amount: Number,
  status: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);