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
  const [dueResult, feesThisMonth] = await Promise.all([
    // 🔹 Total due (all students)
    Student.aggregate([
      {
        $group: {
          _id: null,
          totalDue: { $sum: "$dueFees" },
        },
      },
    ]),
    Student.aggregate([
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
  ]);
  const todayDate = new Date().toISOString().split("T")[0];
  const totalDue = dueResult[0]?.totalDue || 0;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const thisMonthData = await MonthlyReport.findOne({ month, year });
  if (!thisMonthData) {
    thisMonthData = await MonthlyReport.create({
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
  const previousReport = await MonthlyReport.find();
  res.render("listings/fund", {
    totalDue,
    todayDate,
    feesThisMonth,
    previousReport,
    thisMonthYear,
    thisMonthData,
  });
});
module.exports.addExpense = catchAsync(async (req, res) => {
  const { note, amount, paidDate } = req.body;
  if (!amount || amount <= 0) {
    req.flash("error", "Amount must be greater than 0");
    return res.redirect(`/fund`);
  }
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let report = await MonthlyReport.findOne({ month, year });
  if (!report) {
    report = await MonthlyReport.create({
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
  console.log("report of the month");
  console.log(month, year, report);
  report.expenses.push({
    note,
    amount,
    paidDate: paidDate ? new Date(paidDate) : new Date(),
  });
  // Recalculate total expenses
  // report.totalExpenses = report.expenses.reduce((sum, e) => sum + e.amount, 0);
  await report.save();
  req.flash("success", "Expense added successfully");
  res.redirect("/fund");
});
