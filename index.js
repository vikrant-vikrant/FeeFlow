if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const ejsMate = require("ejs-mate");

const students = require("./routes/students");
const setTodayDate = require("./middleware/setTodayDate");
const cronJobs = require("./services/cronJobs");
const { dashboard } = require("./controllers/students.js");
// const mehtodOverride = require("method-override");
// app.use(mehtodOverride("_method"));
const app = express();

/* ---------- Config ---------- */
const PORT = process.env.PORT || 8000;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/DynamicVision";
/* ---------- Mongoose ---------- */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

/* ---------- View engine & static ---------- */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("ERROR in Mongo Session Store:", err);
});
const sessionOptions = {
  store,
  name: "session",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(setTodayDate);
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // res.locals.currUser = req.user; //auth/passport
  next();
});

app.get("/home", (req, res) => {
  res.render("listings/index.ejs");
});
app.get("/blog", (req, res) => {
  res.render("listings/blog.ejs");
});
app.use("/dashboard", dashboard);
app.use("/students", students);
cronJobs.startAll();
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});
app.listen(PORT, () => {
  console.log(`App is listing to port : ${PORT}`);
});
