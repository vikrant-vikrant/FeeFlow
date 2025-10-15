if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
// const morgan = require("morgan");
// const helmet = require("helmet");
// const mongoSanitize = require("express-mongo-sanitize");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");

const studentsRoutes = require("./routes/students");
const dashboardRoutes = require("./routes/students");
const setTodayDate = require("./middleware/setTodayDate");
const cronJobs = require("./services/cronJobs"); // defines & starts cron jobs

const app = express();

/* ---------- Config ---------- */
const PORT = process.env.PORT || 8000;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/DynamicVision";
const SESSION_SECRET = process.env.SESSION_SECRET || "change_this_secret";
/* ---------- Mongoose ---------- */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

/* ---------- View engine & static ---------- */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Middlewares ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet()); // secure headers
app.use(mongoSanitize()); // prevent Mongo operator injection

/* ---------- Session (stored in Mongo) ---------- */
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  touchAfter: 24 * 3600, // seconds
});
store.on("error", (e) => console.log("SESSION STORE ERROR", e));

app.use(
  session({
    store,
    name: "dv.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(flash());

/* ---------- Global locals & custom middleware ---------- */
app.use(setTodayDate); // sets res.locals.todayDate
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // res.locals.currentUser = req.user; // if using auth/passport
  next();
});

/* ---------- Routes ---------- */
app.get("/home", (req, res) => {
  res.render("listings/index.ejs");
});
app.get("/blog", (req, res) => {
  res.render("listings/blog.ejs");
});
app.use("/students", studentsRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.redirect("/students");
});

/* ---------- 404 handler ---------- */
app.all("*", (req, res) => {
  res.status(404).render("errors/404", { url: req.originalUrl });
});

/* ---------- Error handler ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  // In production you might render a polished error page:
  res.status(status).render("errors/error", { status, message, error: err });
});

/* ---------- Start cron jobs (in services/cronJobs) ---------- */
// cronJobs will start itself when required (see example below)
cronJobs.startAll();

/* ---------- Start server & graceful shutdown ---------- */
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received: shutting down gracefully");
  server.close(async () => {
    await mongoose.disconnect();
    console.log("Mongo disconnected. Bye!");
    process.exit(0);
  });
});
