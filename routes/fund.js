const router = require("express").Router();
const fund = require("../controllers/fund");
const { isLoggedIn } = require("../middleware/isLoggedIn");
router.route("/").get(isLoggedIn, fund.fund);
router.route("/expenses").post(isLoggedIn, fund.addExpense);
module.exports = router;
