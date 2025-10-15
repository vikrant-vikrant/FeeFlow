function getTodayIso() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}
module.exports = (req, res, next) => {
  res.locals.todayDate = getTodayIso();
  next();
};
