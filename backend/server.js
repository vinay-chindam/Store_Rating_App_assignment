const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

app.use("/api/admin", require("./routes/admin")); // NEW route

// Add more routes here: store, rating, etc.

app.get("/", (req, res) => res.send("API Running"));

module.exports = app;



const connectDB = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
