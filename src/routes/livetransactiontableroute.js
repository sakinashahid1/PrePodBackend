const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  fetchTransactionsAndUpdate,
  searchTransactions,
  getLatestTransactions,
  bankSettled
} = require("../controllers/livetransactiontablecontroller");


const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);
router.get("/latest100", getLatestTransactions);
router.patch('/settledbybank', verifyToken, bankSettled);
router.get('/updatetransactions', fetchTransactionsAndUpdate);

module.exports = router;
