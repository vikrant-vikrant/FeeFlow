const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deactivatedAt: { type: Date, default: Date.now },
  name: { type: String, require: true },
  grade: { type: String, require: true },
  parent: { type: String },
  contact: { type: Number },
  phone: { type: Number },
  note: { type: String },
  joiningDate: { type: Date, require: true },
  fees: { type: Number },
  dueFees: { type: Number, default: 0 },
  feesHistory: [
    {
      note: { type: String },
      amount: { type: Number, require: true },
      paidDate: { type: Date, default: Date.now },
    },
  ],
  lastDueAdded: { type: Date, default: null },
});
module.exports = mongoose.model("archivedStudent", studentSchema);
