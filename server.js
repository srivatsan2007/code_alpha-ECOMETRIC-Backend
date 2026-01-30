const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
/*const productRoutes = require("./routes/productRoutes");*/

import cors from "cors";
app.use(cors());
app.use(express.json());


const app = express();
app.use(cors());
app.use(express.json());

/* MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/userdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));*/

mongoose.connect(process.env.mongodb+srv://Srivatsan:<db_password>@ecometrix.nmnxbs6.mongodb.net/?appName=ECOMETRIX)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))


/*app.use("/api/products", productRoutes);
app.use("/api/cart", require("./routes/cartRoutes"));*/
app.use("/api/payment", require("./routes/paymentRoutes"));





// UPDATED User Schema (Role Added)
const UserSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  address: String,
  pincode: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" } // ✅ NEW
});

const User = mongoose.model("User", UserSchema);

// Register API
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

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
/*
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

// LOGIN API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
*/

// LOGIN API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/send-invoice", async (req, res) => {
  try {
    const { email, orderId, items, totalAmount } = req.body;

    if (!email || !orderId || !items || !totalAmount) {
      return res.status(400).json({ message: "Missing invoice data" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "srivatsanrterm28j@gmail.com",
        pass: "ccij reuj lhtp jljq" // Gmail App Password
      }
    });

    const itemList = items
      .map(item => `${item.name} × ${item.qty} = ₹${item.price}`)
      .join("\n");

    const mailOptions = {
      from: "your_email@gmail.com",
      to: email,
      subject: `Invoice for Order #${orderId}`,
      text: `
Thank you for your order!

Order ID: ${orderId}

Items:
${itemList}

Total Amount: ₹${totalAmount}

– ECOMETRIX
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Invoice sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send invoice" });
  }
});



// 🚀 START SERVER (ALWAYS LAST)
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});



const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ✅ MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


// Example routes
app.use("/api/payment", require("./routes/paymentRoutes"));


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

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
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

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      name: user.name
    });

  } catch (error) {
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
      .map(item => `${item.name} × ${item.qty} = ₹${item.price}`)
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


// ================= PORT (THIS IS YOUR ANSWER) =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
