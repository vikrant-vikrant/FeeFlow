const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");
const MonthlyReport = require("../models/monthlyReport");
const ArchivedStudent = require("../models/archivedStudent");

function formatDate(date, type = "short") {
  if (!date) return "";
  if (type === "input") return date.toISOString().split("T")[0];
  if (type === "today") return new Date().toISOString().substr(0, 10);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
module.exports.students = catchAsync(async (req, res) => {
  const { filter } = req.query;
  let students;
  if (filter === "due") {
    students = await Student.find({ dueFees: { $gt: 0 }, owner: req.user._id });
  } else {
    students = await Student.find({ owner: req.user._id });
  }
  res.render("listings/students", { studentsData: students });
});
module.exports.showStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const student = await Student.findOne({ _id: id, owner: req.user._id });
  if (!student) throw new ExpressError(404, "Student not found");
  const formattedDate = formatDate(student.joiningDate);
  res.render("listings/show", { student, formattedDate });
});
module.exports.deactivateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findOne({
    _id: id,
    owner: req.user._id,
  });
  if (!student) {
    req.flash("error", "Student not found");
    return res.redirect("/students");
  }
  await ArchivedStudent.create({
    ...student.toObject(),
    _id: undefined,
    deactivatedAt: new Date(),
  });
  await Student.findByIdAndDelete(id);
  req.flash("success", "Student deactivated successfully");
  res.redirect("/students");
});
module.exports.editStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const student = await Student.findOne({ _id: id, owner: req.user._id });
  if (!student) throw new ExpressError(404, "Student not found");
  const formattedDate = formatDate(student.joiningDate, "input");
  res.render("listings/edit", { student, formattedDate }); // create this view
});
module.exports.saveEditStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    grade,
    parent,
    contact,
    phone,
    note,
    joiningDate,
    fees,
    dueFees,
  } = req.body;
  // const student = await Student.findOne({ _id: id, owner: req.user._id });
  // if (!student) throw new ExpressError(404, "Student not found");
  let student = await Student.findOneAndUpdate(
    { _id: id, owner: req.user._id },
    {
      name,
      grade,
      parent,
      contact,
      phone,
      note,
      joiningDate,
      dueFees,
      fees,
    },
    { new: true, runValidators: true },
  );
  if (!student) {
    req.flash("error", "Student not found");
    return res.redirect("/students");
  }
  const formattedDate = formatDate(student.joiningDate);
  // req.flash("success", "Details updated.");
  // res.redirect(`/students/${updatedStudent._id}`);
  res.render("listings/show", {
    student,
    formattedDate,
    // todayDate,
    success: "Details updated.",
  });
});
module.exports.newStudentForm = (req, res) => {
  res.render("listings/newStudent");
};
module.exports.addNewStudent = catchAsync(async (req, res) => {
  const {
    name,
    grade,
    status,
    parent,
    contact,
    phone,
    note,
    joiningDate,
    fees,
    dueFees,
  } = req.body;
  const newStudent = new Student({
    owner: req.user._id,
    name,
    grade,
    status,
    parent,
    contact,
    phone,
    note,
    joiningDate,
    fees,
    dueFees,
  });
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
  thisMonthData.newStudents += 1;
  await thisMonthData.save();
  await newStudent.save();
  req.flash("success", `New student added`);
  res.redirect("/students");
});
module.exports.deleteStudent = catchAsync(async (req, res) => {
  let { id } = req.params;
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
  thisMonthData.studentsLeft += 1;
  await thisMonthData.save();
  let removedStudent = await Student.findOneAndDelete({
    _id: id,
    owner: req.user._id,
  });
  if (!removedStudent) {
    req.flash("error", "Student not found or already deleted.");
    return res.redirect("/students");
  }
  req.flash("success", `${removedStudent.name} has been removed.`);
  res.redirect("/students");
});
module.exports.addFees = catchAsync(async (req, res) => {
  let { id } = req.params;
  let { note, amount, paidOn } = req.body;
  if (!amount || Number(amount) <= 0) {
    req.flash("error", "Amount must be greater than 0");
    return res.redirect(`/students/${id}`);
  }
  amount = Number(amount);
  let paidDate = paidOn ? new Date(paidOn) : new Date();
  const student = await Student.findOne({ _id: id, owner: req.user._id });
  if (!student) {
    return res.status(404).send("Student not found");
  }
  student.feesHistory.push({
    note,
    amount,
    paidDate,
  });
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
  thisMonthData.totalEarning += amount;
  student.dueFees -= amount;
  await student.save();
  await thisMonthData.save();
  req.flash("success", `Fees added for ${student.name}. `);
  res.redirect(`/students?filter=due`);
});
module.exports.archived = catchAsync(async (req, res) => {
  const archived = await ArchivedStudent.find({ owner: req.user._id });
  res.render("listings/archive", { studentsData: archived });
});
module.exports.restoreStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const archivedStudent = await ArchivedStudent.findOne({
    _id: id,
    owner: req.user._id,
  });
  if (!archivedStudent) {
    req.flash("error", "Archived student not found");
    return res.redirect("/students/archived");
  }
  await Student.create({
    ...archivedStudent.toObject(),
    _id: undefined,
  });
  await ArchivedStudent.findByIdAndDelete(id);
  req.flash("success", "Student restored successfully");
  res.redirect("/students");
});
module.exports.deletearchiveStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const archivedStudent = await ArchivedStudent.findOne({
    _id: id,
    owner: req.user._id,
  });
  if (!archivedStudent) {
    req.flash("error", "Archived student not found");
    return res.redirect("/students/archived");
  }
  await ArchivedStudent.findByIdAndDelete(id);
  req.flash("success", "Student deleted successfully");
  res.redirect("/students");
});
module.exports.dashboard = catchAsync(async (req, res) => {
  const students = await Student.find({
    owner: req.user._id,
    dueFees: { $gt: 0 },
  });
  res.render("listings/students", { studentsData: students });
});
