const express = require("express");
const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Admin dashboard2
router.get("admin/dashboard", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const totalUsers = await User.countDocuments();
  const totalStores = await Store.countDocuments();
  const totalRatings = await Rating.countDocuments();

  res.json({ totalUsers, totalStores, totalRatings });
});

// Add new user
router.post("/add-user", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { name, email, password, address, role } = req.body;

  if (!name || name.length < 20 || name.length > 60)
    return res.status(400).json({ message: "Name must be 20-60 chars" });

  if (!/.+@.+\..+/.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  if (!/(?=.*[A-Z])(?=.*[\W_]).{8,16}/.test(password))
    return res.status(400).json({ message: "Weak password" });

  if (!address || address.length > 400)
    return res.status(400).json({ message: "Address too long" });

  const allowedRoles = ["admin", "user", "owner"];
  if (!role || !allowedRoles.includes(role))
    return res.status(400).json({ message: "Invalid role" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, address, role });
  await user.save();

  res.status(201).json({ message: "User added successfully" });
});

// Add new store
router.post("/add-store", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { name, email, address } = req.body;
  if (!name || !email || !address)
    return res.status(400).json({ message: "Missing store data" });

  const existing = await Store.findOne({ email });
  if (existing) return res.status(400).json({ message: "Store with this email already exists" });

  const store = new Store({ name, email, address });
  await store.save();

  res.status(201).json({ message: "Store added successfully" });
});

// List users with filters
router.get("/users", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const filters = {};
  const { name, email, address, role } = req.query;

  if (name) filters.name = new RegExp(name, "i");
  if (email) filters.email = new RegExp(email, "i");
  if (address) filters.address = new RegExp(address, "i");
  if (role) filters.role = role;

  const users = await User.find(filters);
  res.json(users);
});

// List stores with filters
router.get("/stores", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const filters = {};
  const { name, email, address } = req.query;

  if (name) filters.name = new RegExp(name, "i");
  if (email) filters.email = new RegExp(email, "i");
  if (address) filters.address = new RegExp(address, "i");

  const stores = await Store.find(filters);
  res.json(stores);
});

module.exports = router;
