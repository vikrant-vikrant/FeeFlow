const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");
const MonthlyReport = require("../models/monthlyReport");
const archivedStudent = require("../models/archivedStudent");
let thisMonthYear = new Date().toLocaleString("en-US", {
  month: "short",
  year: "numeric",
});
module.exports.fund = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const view = req.query.view;
  let dateFilter;
  if (view === "month") {
    dateFilter = { $gte: startOfMonth, $lt: endOfMonth };
  } else {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    dateFilter = { $gte: threeDaysAgo };
  }
  const [studentResult, archiveFeesThisMonth] = await Promise.all([
    Student.aggregate([
      { $match: { owner: req.user._id } },
      {
        $facet: {
          totalDue: [
            {
              $group: {
                _id: null,
                totalDue: { $sum: "$dueFees" },
              },
            },
          ],
          feesThisMonth: [
            { $unwind: "$feesHistory" },
            {
              $match: {
                "feesHistory.paidDate": dateFilter,
              },
            },
            { $sort: { "feesHistory.paidDate": -1 } },
            {
              $project: {
                name: 1,
                grade: 1,
                "feesHistory.amount": 1,
                "feesHistory.paidDate": 1,
                "feesHistory.note": 1,
              },
            },
          ],
          studentsThisMonth: [
            {
              $match: {
                joiningDate: {
                  $gte: startOfMonth,
                  $lt: endOfMonth,
                },
              },
            },
            {
              $project: {
                name: 1,
                grade: 1,
              },
            },
          ],
        },
      },
    ]),
    // Archived data parallel
    archivedStudent.aggregate([
      { $match: { owner: req.user._id } },
      { $unwind: "$feesHistory" },
      {
        $match: {
          "feesHistory.paidDate": dateFilter,
        },
      },
      { $sort: { "feesHistory.paidDate": -1 } },
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
  // ✅ Extract data from facet
  const data = studentResult[0];
  const totalDue = data.totalDue[0]?.totalDue || 0;
  const feesThisMonth = data.feesThisMonth;
  const stuThisMonth = data.studentsThisMonth;
  const todayDate = new Date().toISOString().split("T")[0];
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let thisMonthData = await MonthlyReport.findOne({
    owner: req.user._id,
    month,
    year,
  }).lean();
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
  // ✅ Calculate expenses
  let total = 0;
  thisMonthData.expenses.forEach((e) => (total += e.amount));
  const balance = Number(thisMonthData.totalEarning) - total;
  res.render("listings/fund", {
    totalDue,
    todayDate,
    feesThisMonth,
    total,
    view,
    balance,
    thisMonthYear: `${month}-${year}`,
    thisMonthData,
    stuThisMonth,
    archiveFeesThisMonth,
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
module.exports.getPreviousReports = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = 3;
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const reports = await MonthlyReport.find({
    owner: req.user._id,
    $or: [{ year: { $lt: year } }, { year, month: { $lt: month } }],
  })
    .sort({ year: -1, month: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  res.json(reports);
};
