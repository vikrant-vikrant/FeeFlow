if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoStore = require("connect-mongo");

// npm uninstall express-session connect-mongo
const cookieParser = require("cookie-parser");

const flash = require("connect-flash");
const ejsMate = require("ejs-mate");

const students = require("./routes/students");
const setTodayDate = require("./middleware/setTodayDate");
const { dashboard, archived } = require("./controllers/students.js");
const { fund } = require("./controllers/fund.js");
const user = require("./routes/user.js");
const { isLoggedIn } = require("./middleware/isLoggedIn");
const mehtodOverride = require("method-override");
const app = express();
app.use(mehtodOverride("_method"));

/* ---------- Config ---------- */
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;
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
app.use(cookieParser());
const attachUser = require("./middleware/attachUser");
app.use(attachUser);

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  ttl: 7 * 24 * 60 * 60,
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
  res.locals.currUser = req.user; //auth/passport
  next();
});

app.get("/home", (req, res) => {
  res.render("listings/index.ejs");
});
app.use("/dashboard", isLoggedIn, dashboard);
app.use("/archived", isLoggedIn, archived);
app.use("/fund", isLoggedIn, fund);
app.use("/students", isLoggedIn, students);
app.use("/", user);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).render("layouts/error.ejs", {
    code: status,
    title: status === 404 ? "Page Not Found" : "Something went wrong",
    message: err.message || "We’re having trouble processing your request.",
  });
});
app.listen(PORT, () => {
  console.log(`App is listing to port : ${PORT}`);
});
