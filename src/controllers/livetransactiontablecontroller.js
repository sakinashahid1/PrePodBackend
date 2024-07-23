require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

async function getLivedata(req, res) {
  try {
    const apiUrl = "https://centpays.com/apidoc/get_all_transaction";
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response");
    }

    const apiData = await response.json();
    const data = apiData.data;

    // Extract all unique IDs from the fetched data
    const uniqueIds = data.map((item) => item.id);

    // Find existing records in the database with the same unique IDs
    const existingRecords = await LiveTransactionTable.find({
      livedata_id: { $in: uniqueIds },
    }).select("livedata_id");

    // Create a Set of existing unique IDs for faster lookup
    const existingIdsSet = new Set(existingRecords.map((record) => record.livedata_id));

    // Filter out existing transactions
    const newRecords = data
      .filter((item) => !existingIdsSet.has(item.id))
      .map((item) => ({
        livedata_id: item.id,
        txnid: item.transactionId,
        merchantTxnId: item.mtxnID,
        merchant:
          item["merchant_name"]
            .trim()
            .charAt(0)
            .toUpperCase() + item["merchant_name"].slice(1).toLowerCase(),
        amount: item.amount,
        fee: item.fee,
        merchant_fee: item.merchant_fee,
        backUrl: item.backUrl,
        merchant_id: item.merchant_id,
        transactiondate: item.transaction_date,
        statusBKP: item.statusBKP,
        Status: item.status,
        isSettled: item.isSettled,
        settledDate: item.settledDate,
        settledTxnId: item.settledTxnId,
        settledAmount: item.settledAmount,
        router: item.router,
        description: item.description,
        email: item.email,
        currency: item.currency,
        env: item.env,
        mode: item.mode,
        paymentgateway: item.payment_mode,
        payment_id: item.payment_id,
        pg_order_key: item.order_key,
        message: item.message,
        webhook_id: item.webhook_id,
        requested_phone: item.requested_phone,
        orderNo: item.requested_orderNumber,
        cname: item.requested_name,
        tempUpdated: item.tempUpdated,
        is_admin_settled: item.is_admin_settled,
        admin_settled_date: item.admin_settled_date,
        admin_settled_amount: item.admin_settled_amount,
        cardtype: item.cardType,
        requestMode: item.requestMode,
        cardnumber: item.cardNo,
        cardExpire: item.cardExpire,
        cardCVC: item.cardCVC,
        pdate: item.pdate,
        country: item.country,
        dels: item.dels,
        web_url: item.web_url,
        mid: item.mid,
        from_temp: item.from_temp,
        accountHolder: item.accountHolder,
        accountBankCode: item.accountBankCode,
        accountNumber: item.accountNumber,
        birthDate: item.birthDate,
        internal_callback: item.internal_callback,
        internal_callback_time: item.internal_callback_time,
      }));

    // Insert new records in bulk
    if (newRecords.length > 0) {
      await LiveTransactionTable.insertMany(newRecords, { ordered: false });
    }

    if (req && res) {
      res.json({ newRecordsCount: newRecords.length });
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    if (req && res) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const interval = 60000; 
setInterval(getLivedata, interval);

async function fetchTransactionsAndUpdate(req, res) {
  const { fromDate, toDate } = req.query;

  if (!fromDate || !toDate) {
    return res.status(400).json({ error: "Missing fromDate or toDate in request" });
  }

  try {
    const apiUrl = `https://centpays.com/apidoc/get_all_transaction?from=${fromDate}&to=${toDate}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response");
    }

    const apiData = await response.json();
    const data = apiData.data;

    const deleteResult = await LiveTransactionTable.deleteMany({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    const newRecords = data.map((item) => ({
      livedata_id: item.id,
            txnid: item.transactionId,
            merchantTxnId: item.mtxnID,
            merchant: item["merchant_name"].trim().charAt(0).toUpperCase() + item["merchant_name"].slice(1).toLowerCase(),
            amount: item.amount,
            fee: item.fee,
            merchant_fee: item.merchant_fee,
            backUrl: item.backUrl,
            merchant_id: item.merchant_id,
            transactiondate: item.transaction_date,
            statusBKP: item.statusBKP,
            Status: item.status,
            isSettled: item.isSettled,
            settledDate: item.settledDate,
            settledTxnId: item.settledTxnId,
            settledAmount: item.settledAmount,
            router: item.router,
            description: item.description,
            email: item.email,
            currency: item.currency,
            env: item.env,
            mode: item.mode,
            paymentgateway: item.payment_mode,
            payment_id: item.payment_id,
            pg_order_key: item.order_key,
            message: item.message,
            webhook_id: item.webhook_id,
            requested_phone: item.requested_phone,
            orderNo: item.requested_orderNumber,
            cname: item.requested_name,
            tempUpdated: item.tempUpdated,
            is_admin_settled: item.is_admin_settled,
            admin_settled_date: item.admin_settled_date,
            admin_settled_amount: item.admin_settled_amount,
            cardtype: item.cardType,
            requestMode: item.requestMode,
            cardnumber: item.cardNo,
            cardExpire: item.cardExpire,
            cardCVC: item.cardCVC,
            pdate: item.pdate,
            country: item.country,
            dels: item.dels,
            web_url: item.web_url,
            mid: item.mid,
            from_temp: item.from_temp,
            accountHolder: item.accountHolder,
            accountBankCode: item.accountBankCode,
            accountNumber: item.accountNumber,
            birthDate: item.birthDate,
            internal_callback: item.internal_callback,
            internal_callback_time: item.internal_callback_time,
    }));
    
    const insertResult = await LiveTransactionTable.insertMany(newRecords);

    res.json({ 
      success: true, 
      message: "Transactions updated successfully",
      insertedCount: insertResult.length,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function searchTransactions(req, res) {
  try {
    const { fromDate, toDate, status } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Both fromDate and toDate are required" });
    }

    const query = {
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      }
    };

    if (status) {
      query.Status = status;
    }

    const transactions = await LiveTransactionTable.find(query);

    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getLatestTransactions(req, res) {
  try {

    const {merchant} = req.query;
    let query = {};
    if (merchant) {
      query.merchant = merchant;
    }
    const transactions = await LiveTransactionTable.find(query).sort({ transactiondate: -1 }).limit(100); 
    if (req && res) {
      res.json(transactions);
    }
  } catch (error) {
    console.error("Error fetching latest transactions:", error);
    if (req && res) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

async function bankSettled(req, res) {
  const { txnids } = req.body;
  const txnidArray = txnids.split(/\s+/).map(txnid => txnid.trim()).filter(txnid => txnid);

  if (txnidArray.length === 0) {
    return res.status(400).json({ message: "Invalid input. Please provide at least one txnid." });
  }

  try {
    const result = await LiveTransactionTable.updateMany(
      { txnid: { $in: txnidArray } },
      { $set: { isBankSettled: 1 } }
    );

    res.status(200).json({
      message: "Transactions updated successfully",
      transactionsMatched: result.matchedCount,
      transactionsModified: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating transactions:", error);
    res.status(500).json({ message: "An error occurred while updating transactions" });
  }
}

module.exports = { getLivedata, fetchTransactionsAndUpdate, searchTransactions, getLatestTransactions, bankSettled };