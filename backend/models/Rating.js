const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
});

module.exports = mongoose.model("Rating", ratingSchema);
