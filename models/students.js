const mongoose = require("mongoose");
// img url and totalFees
const studentSchema = new mongoose.Schema({
  student: [
    {
      name: { type: String, require: true },
      grade: { type: String, require: true },
      fees: { type: Number },
    },
  ],
  parent: { type: String },
  contact: { type: Number },
  phone: { type: Number },
  note: { type: String },
  joiningDate: { type: Date, require: true },
  // totalFees:(we don't need to store total fees i will show it on show.ejs),
  dueFees: { type: Number, default: 0 },
  feesHistory: [
    {
      note: { type: String },
      amount: { type: Number, require: true },
      paidDate: { type: Date, default: Date.now },
    },
  ],
});
module.exports = mongoose.model("DynamicStudents", studentSchema);
