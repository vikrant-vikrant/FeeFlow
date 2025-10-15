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
const cronJobs = require("./services/cronJobs");
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
cronJobs.startAll();
const { dashboard } = require("./controllers/students.js");
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
