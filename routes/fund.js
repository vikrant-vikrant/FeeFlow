const router = require("express").Router();
const fund = require("../controllers/fund");
const { isLoggedIn } = require("../middleware/isLoggedIn");
router.route("/").get(isLoggedIn, fund.fund);
router.route("/expenses").post(isLoggedIn, fund.addExpense);
router.get("/previous", isLoggedIn, fund.getPreviousReports);
module.exports = router;
