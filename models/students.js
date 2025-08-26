const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
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
      month: { type: String, require: true }, // "Aug 2025"
      // dueDate: Date, // e.g., 15 Aug 2025
      amount: { type: Number, require: true }, // e.g., 700
      // paid: { type: Boolean, default: false },
      paidDate: { type: Date, default: Date.now },
    },
  ],
  //sibling info, fees payment history(amount paid & date)
});

module.exports = mongoose.model("DynamicStudents", studentSchema);
