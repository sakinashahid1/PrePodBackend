const express = require("express");
const multer = require('multer');

const {initiateTransaction, getInfoOfTxn, getTransaction, getCallback} = require("../controllers/transactionflowcontroller");

const router = express.Router();
const upload = multer();

router.post("/paymentlink", initiateTransaction);
router.get("/transactionflow/info_transaction", getInfoOfTxn);
router.post("/transactionflow/get_transaction", getTransaction);
router.post("/callbackurl", upload.none(), getCallback);

module.exports = router;