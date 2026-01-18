const mongoose = require("mongoose");

const monthlyReportSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: { type: Number, required: true }, // 1–12
  year: { type: Number, required: true },

  totalEarning: { type: Number, default: 0 },

  expenses: [
    {
      note: { type: String, required: true },
      amount: { type: Number, required: true },
      paidDate: { type: Date, default: Date.now },
    },
  ],
  totalExpenses: { type: Number, default: 0 },

  newStudents: { type: Number, default: 0 },
  studentsLeft: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// prevent duplicate month
monthlyReportSchema.index({ owner: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
