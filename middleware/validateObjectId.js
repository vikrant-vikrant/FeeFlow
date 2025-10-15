const mongoose = require("mongoose");
module.exports = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid ID");
    return res.redirect("/students");
  }
  next();
};
