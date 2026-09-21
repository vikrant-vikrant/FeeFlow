import mongoose from "mongoose";
const MONGO_URL = process.env.MONGO_URL;
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
export default connectDB;
