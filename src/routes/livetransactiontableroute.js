const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");

const {
  getLivedata, 
  searchTransactions,
  getLatestTransactions,
  bankSettled
} = require("../controllers/livetransactiontablecontroller");


const router = express.Router();

router.get("/getlivedata", getLivedata);
router.get("/searchtxn", searchTransactions);
router.get("/latest100", getLatestTransactions);
router.patch('/settledbybank', verifyToken, bankSettled);

module.exports = router;
