const mongoose = require("mongoose");

function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid student id");
    return res.redirect("/students");
  }
  next();
}

module.exports = validateObjectId;
