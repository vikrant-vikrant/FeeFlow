const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const wrapAsync = require("../utils/catchAsync");
const userController = require("../controllers/user.js");
router.get("/", (req, res) => {
  if (req.user) return res.redirect("/students");
  res.render("listings/index");
});
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderloginForm)
  .post(wrapAsync(userController.login));

router.get("/logout", userController.logout);
router.get(  // Step 1: Redirect to Google
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(  // Step 2: Callback
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.redirect("/students");
  },
);
module.exports = router;
