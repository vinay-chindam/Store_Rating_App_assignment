const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Store", storeSchema);
