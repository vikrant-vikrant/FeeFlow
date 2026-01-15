const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/catchAsync");
const userController = require("../controllers/user.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderloginForm)
  .post(wrapAsync(userController.login));

router.get("/logout", userController.logout);
module.exports = router;
