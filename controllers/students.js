const mongoose = require("mongoose");
const Student = require("../models/students");

module.exports.students = async (req, res) => {
  try {
    const students = await Student.find({});
    res.render("listings/students", { studentsData: students });
  } catch (err) {
    next(err);
  }
};
module.exports.showStudent = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
module.exports.editStudent = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
module.exports.saveEditStudent = async (req, res, next) => {
  try {
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
    res.render("listings/show", { student, formattedDate });
  } catch (err) {
    next(err);
  }
};
module.exports.newStudentForm = (req, res) => {
  res.render("listings/newStudent");
};
module.exports.addNewStudent = async (req, res) => {
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
  try {
    await newStudent.save();
    console.log("Student saved");
    res.redirect("/students");
  } catch (err) {
    console.error("Error saving student:", err);
    res.status(500).send("Something went wrong");
  }
};
module.exports.deleteStudent = async (req, res) => {
  let { id } = req.params;
  let removeStudent = await Student.findByIdAndDelete(id);
  if (!removeStudent) {
    throw new ExpressError(404, "Student not found");
  }
  res.redirect("/students");
};
module.exports.addFees = async (req, res) => {
  let { id } = req.params;
  const { month, amount, paidOn } = req.body;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).send("Student not found");
    }
    // Add fees entry to the student's feesHistory
    student.feesHistory.push({
      month,
      amount,
      paidDate: paidOn ? new Date(paidOn) : new Date(),
    });
    student.dueFees -= amount;
    await student.save();
    console.log("Fees added successfully");
    res.redirect(`/students/${id}`);
  } catch (err) {
    console.error("Error adding fees:", err);
    res.status(500).send("Something went wrong");
  }
};
