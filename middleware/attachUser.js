const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    res.locals.currUser = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    req.user = user;
    res.locals.currUser = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    req.user = null;
    res.locals.currUser = null;
    next();
  }
};
