const express = require("express");
const mongoose = require("mongoose");
const app = express();
// const router = express.Router();
const path = require("path");
const StudentSchema = require("./models/students.js");
const Student = require("./models/students");
const mehtodOverride = require("method-override");
app.use(mehtodOverride("_method"));

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
const MONGO_URL = "mongodb://127.0.0.1:27017/DynamicVision";
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.get("/home", (req, res) => {
  res.render("listings/index.ejs");
});
app.get("/blog", (req, res) => {
  res.render("listings/blog.ejs");
});
// students - list all students
app.get("/students", async (req, res, next) => {
  try {
    const students = await Student.find({});
    res.render("listings/students", { studentsData: students }); // matches your EJS var
  } catch (err) {
    next(err);
  }
});

// show - show one student
app.get("/student/:id", async (req, res, next) => {
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
    if (!student) {
      req.flash("error", "Student not found");
      return res.redirect("/students");
    }
    res.render("listings/show", { student, formattedDate }); // create this view
  } catch (err) {
    next(err);
  }
});
//edit route
app.get("/student/:id/edit", async (req, res, next) => {
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
});
//edit route
app.put("/student/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
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
    let updatedStudent = await Student.findByIdAndUpdate(id, {
      name: name,
      grade: grade,
      status: status,
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
});
//to add newStudent
app.get("/newStudent", (req, res) => {
  res.render("listings/newStudent.ejs");
});
//to push newStudent data
app.post("/newStudent", async (req, res) => {
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
  const newStudent = new StudentSchema({
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
});
//to remove a student
app.delete("/student/:id", async (req, res) => {
  let { id } = req.params;
  let removeStudent = await Student.findByIdAndDelete(id);
  if (!removeStudent) {
    throw new ExpressError(404, "Student not found");
  }
  res.redirect("/students");
});
//addFees
app.post("/student/:id/addFees", async (req, res) => {
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
    await student.save();
    console.log("Fees added successfully");
    res.redirect(`/student/${id}`);
  } catch (err) {
    console.error("Error adding fees:", err);
    res.status(500).send("Something went wrong");
  }
});
app.listen(8000, () => {
  console.log(`App is listing to port : 8000`);
});
