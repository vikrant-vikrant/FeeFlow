const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    default: null,
  },
  googleId: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", userSchema);
