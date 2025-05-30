const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 60,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  address: {
    type: String,
    maxlength: 400,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "owner"],
    default: "user",
  },
});

module.exports = mongoose.model("User", userSchema);
