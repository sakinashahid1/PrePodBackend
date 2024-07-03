const express = require("express");
const multer = require('multer');

const {initiateTransaction, getInfoOfTxn, getTransaction, getCallback, getWebhook} = require("../controllers/transactionflowcontroller");

const router = express.Router();
const upload = multer();

router.post("/paymentlink", initiateTransaction);
router.get("/transactionflow/info_transaction", getInfoOfTxn);
router.get("/transactionflow/get_transaction", getTransaction);
router.post("/callbackurl", upload.none(), getCallback);
router.post("/webhookurl", getWebhook);

module.exports = router;