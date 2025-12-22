const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");

module.exports.fund = catchAsync(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = now.getFullYear();
  const [earningResult, dueResult, students, newAdmissions] = await Promise.all(
    [
      // 🔹 Total earning this month
      Student.aggregate([
        { $unwind: "$feesHistory" },
        {
          $match: {
            "feesHistory.paidDate": {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalEarning: { $sum: "$feesHistory.amount" },
          },
        },
      ]),
      // 🔹 Total due (all students)
      Student.aggregate([
        {
          $group: {
            _id: null,
            totalDue: { $sum: "$dueFees" },
          },
        },
      ]),
      // 🔹 All students (for display)
      Student.find({}),
      Student.find({
        $expr: {
          $and: [
            { $eq: [{ $month: "$joiningDate" }, currentMonth] },
            { $eq: [{ $year: "$joiningDate" }, currentYear] },
          ],
        },
      }),
    ]
  );
  // 📊 Safe extraction
  const totalEarningThisMonth = earningResult[0]?.totalEarning || 0;
  const totalDue = dueResult[0]?.totalDue || 0;
  const newAdmissionsCount = newAdmissions.length;
  res.render("listings/fund", {
    studentsData: students,
    totalEarningThisMonth,
    totalDue,
    newAdmissions,
    newAdmissionsCount,
  });
});
