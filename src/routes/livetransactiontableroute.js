const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  fetchTransactionsAndUpdate,
  searchTransactions,
  getLatestTransactions,
  bankSettled,binAPI,load7daysData
} = require("../controllers/livetransactiontablecontroller");

const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);
router.get("/latest100", getLatestTransactions);
router.patch('/settledbybank', verifyToken, bankSettled);
router.post('/updatetransactions', fetchTransactionsAndUpdate);
router.get("/load7daysdata", load7daysData);
router.post('/v1/bindata', binAPI);

module.exports = router;