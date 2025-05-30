const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const Store = require("../models/Store");
const authenticate = require("../middleware/auth");

// 📌 Add or update a rating
router.post("/:storeId", authenticate, async (req, res) => {
  const { rating } = req.body;
  const { storeId } = req.params;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Check if the store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if user already rated this store
    let existingRating = await Rating.findOne({ userId: req.user.id, storeId });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
      res.json({ message: "Rating updated", rating: existingRating });
    } else {
      const newRating = new Rating({
        rating,
        userId: req.user.id,
        storeId,
      });
      await newRating.save();
      res.status(201).json({ message: "Rating added", rating: newRating });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// 📌 Get ratings for a store
router.get("/:storeId", async (req, res) => {
  try {
    const ratings = await Rating.find({ storeId: req.params.storeId }).populate("userId", "name");
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ratings", error: err });
  }
});

// 📌 Get current user's rating for a store
router.get("/my/:storeId", authenticate, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      userId: req.user.id,
      storeId: req.params.storeId,
    });

    if (!rating) {
      return res.status(404).json({ message: "No rating found from user" });
    }

    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: "Error fetching rating", error: err });
  }
});

module.exports = router;
