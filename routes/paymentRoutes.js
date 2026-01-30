const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Save payment + order
router.post("/success", async (req,res)=>{
  const { transactionId, amount, products } = req.body;

  await Payment.create({
    transactionId,
    amount,
    status:"success"
  });

  await Order.create({
    transactionId,
    products,
    total: amount
  });

  res.json({ message:"Payment recorded" });
});

module.exports = router;