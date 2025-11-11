const mongoose = require("mongoose");
const Student = require("../models/students");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/DynamicVision";
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
async function addMonthlyDueFees() {
  try {
    const students = await Student.find();
    const today = new Date();
    for (let s of students) {
      if (!s.joiningDate) continue;
      if (today.getDate() !== s.joiningDate.getDate()) continue;
      const last = s.lastDueAdded;
      if (
        !last ||
        last.getMonth() !== today.getMonth() ||
        last.getFullYear() !== today.getFullYear()
      ) {
        s.dueFees = (s.dueFees || 0) + (s.fees || 0);
        s.lastDueAdded = today;
        await s.save();
        console.log(`✅ Added due for ${s.name}`);
      } else {
        console.log(`⚠️ Already added fees for ${s.name} this month`);
      }
    }
    console.log("🎉 Monthly due update completed!");
  } catch (err) {
    console.error("Auto-due job error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  }
}
async function main() {
  await connectDB();
  await addMonthlyDueFees();
}
main();
