const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

module.exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // 1️⃣ Check token exists
    if (!token) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Find user
    const user = await userModel.findById(decoded.id);
    if (!user) {
      res.clearCookie("token");
      req.flash("error", "Session expired. Please login again");
      return res.redirect("/login");
    }

    // 4️⃣ Attach user to request
    req.user = user;
    // req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.clearCookie("token");
    req.flash("error", "Please login again");
    res.redirect("/login");
  }
};
