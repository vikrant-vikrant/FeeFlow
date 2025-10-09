const Student = require("../models/students");
const catchAsync = require("../utils/catchAsync");

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
  const students = await Student.find({});
  res.render("listings/students", { studentsData: students });
});
module.exports.showStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const student = await Student.findById(id);
  if (!student) throw new ExpressError(404, "Student not found");
  const formattedDate = formatDate(student.joiningDate);
  res.render("listings/show", { student, formattedDate });
});
module.exports.editStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const student = await Student.findById(id);
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
  const student = await Student.findById(id);
  if (!student) throw new ExpressError(404, "Student not found");
  let updatedStudent = await Student.findByIdAndUpdate(
    id,
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
    { new: true, runValidators: true }
  );
  if (!updatedStudent) {
    req.flash("error", "Student not found");
    return res.redirect("/students");
  }
  const formattedDate = formatDate(student.joiningDate);
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
  await newStudent.save();
  req.flash("success", `New student added`);
  res.redirect("/students");
});
module.exports.deleteStudent = catchAsync(async (req, res) => {
  let { id } = req.params;
  let removeStudent = await Student.findByIdAndDelete(id);
  if (!removeStudent) {
    throw new ExpressError(404, "Student not found");
  }
  req.flash("success", `Student removed.`);
  res.redirect("/students");
});
module.exports.addFees = catchAsync(async (req, res) => {
  let { id } = req.params;
  const { note, amount, paidOn } = req.body;
  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).send("Student not found");
  }
  student.feesHistory.push({
    note,
    amount,
    paidDate: paidOn ? new Date(paidOn) : new Date(),
  });
  student.dueFees -= amount;
  await student.save();
  req.flash("success", `Fees added for ${student.name}. `);
  res.redirect(`/students/${id}`);
});
module.exports.dashboard = catchAsync(async (req, res) => {
  const students = await Student.find({ dueFees: { $gt: 0 } });
  res.render("listings/dashboard", { studentsData: students });
});
