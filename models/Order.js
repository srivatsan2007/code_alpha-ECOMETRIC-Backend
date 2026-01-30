const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String
  },

  products: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number
    }
  ],

  total: {
    type: Number,
    required: true
  },

  user: {
    type: String
  },

  status: {
    type: String,
    default: "Pending"
  },

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Order", orderSchema);