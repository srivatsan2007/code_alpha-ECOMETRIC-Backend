const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt"); // ✅ for hashing passwords
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= MongoDB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// ================= USER SCHEMA =================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

const User = mongoose.model("User", UserSchema);

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, mobile, address, pincode, email, password, role } = req.body;

    // Basic validation
    if (!name || !mobile || !address || !pincode || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      mobile,
      address,
      pincode,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR 👉", err);

    // Handle Mongo duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
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
    console.error("INVOICE ERROR 👉", err);
    res.status(500).json({ message: "Failed to send invoice" });
  }
});

// ================= PORT =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
