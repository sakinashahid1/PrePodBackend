const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  searchTransactionReport,
  quickSearch,
  compareReport,
  searchSettledTransactions
} = require("../controllers/reportscontroller");

const router = express.Router();

router.post("/transactionreport", verifyToken, searchTransactionReport);
router.post("/comparereport", verifyToken, compareReport);
router.get("/transactionreport", verifyToken, quickSearch);
router.post("/searchsettledtransactions", verifyToken, searchSettledTransactions);

module.exports = router;
