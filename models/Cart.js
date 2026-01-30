const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: String,   // later from login
  productId: String,
  name: String,
  price: Number,
  image: String,
  quantity: Number
});

module.exports = mongoose.model("Cart", cartSchema);