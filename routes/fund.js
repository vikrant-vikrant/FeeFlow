const express = require("express");
const router = express.Router();
const fund = require("../controllers/fund");
const { isLoggedIn } = require("../middleware/isLoggedIn");
router.route("/fund").get(isLoggedIn, fund.fund);
router.route("/fund/expenses").post(isLoggedIn, fund.addExpense);
