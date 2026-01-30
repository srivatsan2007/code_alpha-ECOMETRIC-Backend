const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// ================= MongoDB =================

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// ================= USER SCHEMA =================

const UserSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  address: String,
  pincode: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

const User = mongoose.model("User", UserSchema);


// ================= REGISTER =================

app.post("/register", async (req, res) => {
  try {
    const { name, mobile, address, pincode, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      name,
      mobile,
      address,
      pincode,
      email,
      password,
      role
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.password !== password) return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ================= SEND INVOICE =================

app.post("/send-invoice", async (req, res) => {
  try {
    const { email, orderId, items, totalAmount } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemList = items
      .map(item => `${item.name} x ${item.qty} = ₹${item.price}`)
      .join("\n");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invoice #${orderId}`,
      text: `Items:\n${itemList}\n\nTotal: ₹${totalAmount}`
    });

    res.json({ message: "Invoice sent successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send invoice" });
  }
});


// ================= PORT =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
