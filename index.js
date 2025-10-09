if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const students = require("./routes/students.js");
const Student = require("./models/students");
const mehtodOverride = require("method-override");
app.use(mehtodOverride("_method"));
const setTodayDate = require("./middleware/setTodayDate");
app.use(setTodayDate);

const flash = require("connect-flash");
const session = require("express-session");
app.use(
  session({
    secret: "vikrant",
    saveUninitializ: true,
    resave: true,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
// const MONGO_URL = process.env.ATLASDB_URL;
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
async function addMonthlyDueFees() {
  try {
    const students = await Student.find();

    for (let student of students) {
      if (!student.joiningDate) continue;

      const today = new Date();
      const joinDay = student.joiningDate.getDate(); // e.g., 15
      // check if today is due day
      if (today.getDate() === joinDay) {
        const lastDue = student.lastDueAdded;
        // prevent duplicate due fees in the same month
        if (
          !lastDue ||
          lastDue.getMonth() !== today.getMonth() ||
          lastDue.getFullYear() !== today.getFullYear()
        ) {
          student.dueFees += student.fees; // add fee
          student.lastDueAdded = today; // update tracker
          await student.save();
          console.log(`✅ Added due fee for ${student.name}`);
        } else {
          console.log(`⚠️ Already added fees for ${student.name} this month`);
        }
      }
    }
  } catch (err) {
    console.error("Error in auto due fees:", err);
  }
}
const cron = require("node-cron");
const { dashboard } = require("./controllers/students.js");
// Run every day at midnight
cron.schedule("0 0 * * *", () => {
  addMonthlyDueFees();
});

app.get("/home", (req, res) => {
  res.render("listings/index.ejs");
});
app.get("/blog", (req, res) => {
  res.render("listings/blog.ejs");
});
app.use("/dashboard", dashboard);
app.use("/students", students);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong! 🚨");
});
app.listen(8000, () => {
  console.log(`App is listing to port : 8000`);
});
