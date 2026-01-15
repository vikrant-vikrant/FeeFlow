const mongoose = require("mongoose");
const Student = require("./models/monthlyReport");
// const Student = require("./models/students");
const User = require("./models/user");

// mongoose.connect("mongodb://127.0.0.1:27017/DynamicVision");

(async () => {
  try {
    const owner = await User.findOne({ email: "demo@gmail.com" });
    if (!owner) {
      console.log("❌ Owner not found");
      process.exit();
    }

    const result = await Student.updateMany(
      { owner: { $exists: false } }, // only students without owner
      { $set: { owner: owner._id } }
    );

    console.log("✅ Migration complete");
    console.log("Modified:", result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();
