const express = require("express");
const router = express.Router();
const fund = require("../controllers/fund");

router.route("/fund").get(fund.fund);
router.route("/fund/expenses").post(fund.addExpense);
