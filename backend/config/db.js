const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://nnani5378a:glZ8JUdN6Up9weFl@cluster0.veiis04.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected");
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
