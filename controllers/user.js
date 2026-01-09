const { model } = require("mongoose");
const userModel = require("../models/user.js");
const catchAsync = require("../utils/catchAsync.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.renderSignupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  // try {
  let { username, email, password } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let createdUser = await userModel.create({
        username,
        email,
        password: hash,
      });
      let token = jwt.sign({ email }, "your-secret-key");
      res.cookie("token", token);
      res.send(createdUser);
    });
  });
  // const createdUser = await User.register(username, email, password);

  // res.send(createdUser);
  // req.login(registeredUser, (err) => {
  //   if (err) {
  //     return next(err);
  //   }
  //   req.flash("success", "Welcome to student management system");
  //   res.redirect("/students");
  // });
  // }
  //  catch (e) {
  //   req.flash("error", e.message);
  //   res.redirect("/signup");
  // }
};

module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "welcome back to wanderlust!");
  let redirectUrl = res.locals.redirectUrl || "/students";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out now");
    res.redirect("/home");
  });
};
