const userModel = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    //  Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const createdUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    //  Generate JWT
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    //  Save token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    req.flash("success", "Welcome to Student Management System");
    res.redirect("/students");
  } catch (e) {
    console.error(e);
    req.flash("error", "Signup failed");
    res.redirect("/signup");
  }
};

module.exports.renderloginForm = (req, res) => {
  res.render("./users/login.ejs");
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.flash("success", "Welcome back to Student Management System");
    res.redirect("/students");
  } catch (error) {
    console.error(error);
    req.flash("error", "Login failed");
    res.redirect("/login");
  }
};
module.exports.logout = (req, res) => {
  res.clearCookie("token");
  req.flash("success", "Logged out successfully");
  res.redirect("/home");
};
module.exports.guestLogin = async (req, res) => {
  try {
    let guestUser = await userModel.findOne({ email: "demo@gmail.com" });
    if (!guestUser) {
      req.flash("error", "Guest user not found");
      return res.redirect("/login");
    }
    const token = jwt.sign(
      { id: guestUser._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      sameSite: "lax",
      maxAge: 4 * 60 * 60 * 1000,
    });
    req.flash("success", "Logged in as guest user");
    res.redirect("/students");
  } catch (error) {
    console.error(error);
    req.flash("error", "Guest login failed");
    res.redirect("/login");
  }
};
