const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const authenticate = require("../middleware/auth");

// 📌 Create a store (only owners)
router.post("/", authenticate, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only owners can add stores" });
  }

  const { name, email, address } = req.body;
  try {
    const newStore = new Store({
      name,
      email,
      address,
      ownerId: req.user.id,
    });

    await newStore.save();
    res.status(201).json({ message: "Store created successfully", store: newStore });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// 📌 Get all stores (open to all)
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find().populate("ownerId", "name email");
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stores", error: err });
  }
});

// 📌 Get stores owned by current owner
router.get("/my-stores", authenticate, async (req, res) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Only store owners can view this" });
  }

  try {
    const stores = await Store.find({ ownerId: req.user.id });
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stores", error: err });
  }
});

module.exports = router;
