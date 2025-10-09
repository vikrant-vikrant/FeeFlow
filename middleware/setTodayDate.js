const { getTodayDate } = require("../utils/dateUtils");

function setTodayDate(req, res, next) {
  res.locals.todayDate = getTodayDate();
  next();
}

module.exports = setTodayDate;
