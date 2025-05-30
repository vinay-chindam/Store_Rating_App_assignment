  const express = require("express");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const User = require("../models/User");
  const authenticate = require("../middleware/auth");
  const Store = require("../models/Store");
  const Rating = require("../models/Rating");



  const router = express.Router();

  // Signup
  router.post("/signup", async (req, res) => {
  console.log("in signup");
  const { name, email, password, address, role } = req.body;

  // Name validation
  if (!name || name.length < 20 || name.length > 60)
    return res.status(400).json({ message: "Name must be 20-60 characters" });

  // Email validation
  if (!/.+@.+\..+/.test(email))
    return res.status(400).json({ message: "Invalid email format" });

  // Password validation
  if (!/(?=.*[A-Z])(?=.*[\W_]).{8,16}/.test(password))
    return res.status(400).json({ message: "Password must be 8-16 characters and include an uppercase letter and a special character" });

  // Address validation (optional, based on your rules)
  if (!address || address.length > 400)
    return res.status(400).json({ message: "Address is required and must not exceed 400 characters" });

  // Role validation
  const allowedRoles = ["admin", "user", "owner"];
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Role must be 'admin', 'user', or 'owner'" });
  }

  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already registered" });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save user
  const user = new User({ name, email, password: hashedPassword, address, role });
  await user.save();

  res.status(201).json({ message: "Signup successful" });
});


  // Login
  router.post("/login", async (req, res) => {
      console.log("Request body:", req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
  { id: user._id, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);


    res.json({ token, user: { id: user._id, role: user.role, name: user.name } });
  });

  router.get("/admin/dashboard", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  

  const totalUsers = await User.countDocuments();
  console.log(totalUsers)
  const totalStores = await Store.countDocuments();
  const totalRatings = await Rating.countDocuments();
  console.log(totalUsers)

  res.json({ totalUsers, totalStores, totalRatings });
});

router.post("/admin/add-user", authenticate, async (req, res) => {
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

router.post("/admin/add-store", authenticate, async (req, res) => {
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



router.get("/owner/dashboard", authenticate, async (req, res) => {
  console.log("am in owner dashboard")
  if (req.user.role !== "owner") return res.status(403).json({ message: "Forbidden" });
  // get owner dashboard data
  res.json({ averageRating: 4.5, users: [{ _id: "1", name: "User1", rating: 5 }] });
});



router.get("/user/dashboard", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Fetch all stores
    const stores = await Store.find();

    // Compute average rating for each store
    const storesWithRatings = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ storeId: store._id });
        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : null;

        return {
          _id: store._id,
          name: store.name,
          address: store.address,
          averageRating,
        };
      })
    );

    // Fetch this user's ratings
    const userRatingsData = await Rating.find({ userId: req.user._id });
    const userRatings = {};
    userRatingsData.forEach((r) => {
      userRatings[r.storeId] = r.rating;
    });

    // Respond with stores and user's ratings
    res.json({
      stores: storesWithRatings,
      userRatings,
    });

  } catch (error) {
    console.error("Error in user dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




router.post("/user/rate/:storeId", authenticate, async (req, res) => {
  try {
    console.log("in apiii")
    const { storeId } = req.params;
    const { rating } = req.body;

    // Only users can rate
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can rate stores." });
    }

    // Validate rating
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }

    // Optional: check if store exists
    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      return res.status(404).json({ message: "Store not found." });
    }

    // Check if user already rated this store
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      storeId,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = numericRating;
      await existingRating.save();
      return res.json({ message: "Rating updated successfully." });
    } else {
      // Create new rating
      const newRating = new Rating({
        userId: req.user._id,
        storeId,
        rating: numericRating,
      });
      await newRating.save();
      return res.json({ message: "Rating submitted successfully." });
    }

  } catch (err) {
    console.error("Rating error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});





  module.exports = router;
