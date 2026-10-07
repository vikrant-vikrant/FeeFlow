const mongoose = require("mongoose");
const MONGO_URL = process.env.MONGO_URL;
module.exports = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};