const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");
const MonthlyReport = require("../models/monthlyReport");
let thisMonthYear = new Date().toLocaleString("en-US", {
  month: "short",
  year: "numeric",
});
module.exports.fund = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [dueResult, feesThisMonth, stuThisMonth] = await Promise.all([
    // 🔹 Total due (all students)
    Student.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: null,
          totalDue: { $sum: "$dueFees" },
        },
      },
    ]),
    Student.aggregate([
      { $match: { owner: req.user._id } },
      { $unwind: "$feesHistory" },

      {
        $match: {
          "feesHistory.paidDate": { $gte: startOfMonth, $lt: endOfMonth },
        },
      },

      {
        $sort: {
          "feesHistory.paidDate": -1, // ascending
        },
      },

      {
        $project: {
          name: 1,
          grade: 1,
          "feesHistory.amount": 1,
          "feesHistory.paidDate": 1,
          "feesHistory.note": 1,
        },
      },
    ]),
    Student.find({
      owner: req.user._id,
      joiningDate: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    }).select("name grade"),
  ]);
  const todayDate = new Date().toISOString().split("T")[0];
  const totalDue = dueResult[0]?.totalDue || 0;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let thisMonthData = await MonthlyReport.findOne({
    owner: req.user._id,
    month,
    year,
  });
  if (!thisMonthData) {
    thisMonthData = await MonthlyReport.create({
      owner: req.user._id,
      month,
      year,
      totalEarning: 0,
      expenses: [],
      totalExpenses: 0,
      newStudents: 0,
      studentsLeft: 0,
      createdAt: new Date(),
    });
  }
  const previousReport = await MonthlyReport.find({
    owner: req.user._id,
    $or: [
      { year: { $lt: year } }, // any past year
      { year: year, month: { $lt: month } }, // same year but earlier months
    ],
  }).sort({ year: -1, month: -1 });
  res.render("listings/fund", {
    totalDue,
    todayDate,
    feesThisMonth,
    previousReport,
    thisMonthYear,
    thisMonthData,
    stuThisMonth,
  });
});
module.exports.addExpense = catchAsync(async (req, res) => {
  const { note, amount, paidDate } = req.body;
  if (!note || note.trim() === "") {
    req.flash("error", "Expense note is required");
    return res.redirect("/fund");
  }
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    req.flash("error", "Amount must be greater than 0");
    return res.redirect("/fund");
  }
  const paid = paidDate ? new Date(paidDate) : new Date();
  const month = paid.getMonth() + 1;
  const year = paid.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  paid.setHours(0, 0, 0, 0);
  if (paid > today) {
    req.flash("error", "You cannot add expenses for a future date");
    return res.redirect("/fund");
  }
  const minDate = new Date("2024-01-01");
  minDate.setHours(0, 0, 0, 0);
  if (paid < minDate) {
    req.flash("error", "Expense date is too old");
    return res.redirect("/fund");
  }
  try {
    let report = await MonthlyReport.findOne({
      owner: req.user._id,
      month,
      year,
    });

    if (!report) {
      report = new MonthlyReport({
        owner: req.user._id,
        month,
        year,
        expenses: [],
        totalExpenses: 0,
        totalEarning: 0,
        newStudents: 0,
        studentsLeft: 0,
        createdAt: new Date(),
      });
    }
    report.expenses.push({
      note,
      amount: amt,
      paidDate: paid,
    });

    report.totalExpenses += amt;
    await report.save();
    req.flash("success", "Expense added successfully");
    res.redirect("/fund");
  } catch (err) {
    console.error("SAVE ERROR:", err);
    // duplicate month protection
    if (err.code === 11000) {
      req.flash("error", "Monthly report already exists. Try again.");
    } else {
      req.flash("error", "Failed to save expense");
    }
    req.flash("error", err.message);
    return res.redirect("/fund");
  }
});
