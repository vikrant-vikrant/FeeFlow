const mongoose = require("mongoose");
const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");

module.exports.students = catchAsync(async (req, res) => {
  const students = await Student.find({});
  res.render("listings/students", { studentsData: students });
});
module.exports.showStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // validate id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid student id");
    return res.redirect("/students");
  }
  const student = await Student.findById(id);
  const formattedDate = student.joiningDate.toLocaleDateString("en-GB", {
    weekday: "short", // Fri
    day: "2-digit", // 15
    month: "short", // Aug
    year: "numeric", // 2025
  });
  const todayDate = new Date().toISOString().substr(0, 10);
  if (!student) {
    req.flash("error", "Student not found");
    return res.redirect("/students");
  }
  res.render("listings/show", { student, formattedDate, todayDate });
});
module.exports.editStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // validate id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid student id");
    return res.redirect("/students");
  }
  const student = await Student.findById(id);
  if (!student) {
    req.flash("error", "Student not found");
    return res.redirect("/students");
  }

  // Convert to YYYY-MM-DD for input type="date"
  const formattedDate = student.joiningDate
    ? student.joiningDate.toISOString().split("T")[0]
    : "";
  res.render("listings/edit", { student, formattedDate }); // create this view
});
module.exports.saveEditStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, grade, parent, contact, phone, note, joiningDate, fees } =
    req.body;
  let updatedStudent = await Student.findByIdAndUpdate(id, {
    name: name,
    grade: grade,
    parent: parent,
    contact: contact,
    phone: phone,
    note: note,
    joiningDate: joiningDate,
    fees: fees,
  });
  const student = await Student.findById(id);
  const formattedDate = student.joiningDate.toLocaleDateString("en-GB", {
    weekday: "short", // Fri
    day: "2-digit", // 15
    month: "short", // Aug
    year: "numeric", // 2025
  });
  const todayDate = new Date().toISOString().substr(0, 10);
  res.render("listings/show", { student, formattedDate, todayDate });
});
module.exports.newStudentForm = (req, res) => {
  const todayDate = new Date().toISOString().substr(0, 10);
  res.render("listings/newStudent", { todayDate });
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
  } = req.body;
  const newStudent = new Student({
    name,
    grade,
    status,
    parent,
    contact,
    phone,
    note,
    joiningDate,
    fees,
  });
  await newStudent.save();
  console.log("Student saved");
  res.redirect("/students");
});
module.exports.deleteStudent = catchAsync(async (req, res) => {
  let { id } = req.params;
  let removeStudent = await Student.findByIdAndDelete(id);
  if (!removeStudent) {
    throw new ExpressError(404, "Student not found");
  }
  res.redirect("/students");
});
module.exports.addFees = catchAsync(async (req, res) => {
  let { id } = req.params;
  const { note, amount, paidOn } = req.body;
  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).send("Student not found");
  }
  // Add fees entry to the student's feesHistory
  student.feesHistory.push({
    note,
    amount,
    paidDate: paidOn ? new Date(paidOn) : new Date(),
  });
  student.dueFees -= amount;
  await student.save();
  console.log("Fees added successfully");
  res.redirect(`/students/${id}`);
});
module.exports.dashboard = catchAsync(async (req, res) => {
  const students = await Student.find({ dueFees: { $gt: 0 } });
  res.render("listings/dashboard", { studentsData: students });
});
