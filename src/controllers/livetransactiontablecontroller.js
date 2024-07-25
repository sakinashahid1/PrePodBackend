require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");
const Bintable = require("../models/BinTable")

let apiToggle = true;

async function fetchFromAPILayer(bin) {
  try {
    console.log(`Fetching BIN ${bin} from APILayer`);
    const response = await fetch(`https://api.apilayer.com/bincheck/${bin}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": "HTV7fMFkUr75uzRshmoVJIzop2UA8ftk"
      }
    });

    if (!response.ok) {
      throw new Error(`APILayer response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    return [data["scheme"], data["country"]];
  } catch (error) {
    console.error(`Error fetching BIN ${bin} from APILayer:`, error);
    throw error;
  }
}

async function fetchFromNeutrinoAPI(bin) {
  try {
    console.log(`Fetching BIN ${bin} from NeutrinoAPI`);
    const response = await fetch(`https://neutrinoapi.net/bin-lookup?bin-number=${bin}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-ID": "anna_garcia",
        "API-Key": "DSg30BvjVzYpbUeuz3Mkp3g2DH0D4FhpvlFp7YuAhASfABQZ"
      }
    });

    if (!response.ok) {
      throw new Error(`NeutrinoAPI response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    return [data["card-brand"], data["country"]];
  } catch (error) {
    console.error(`Error fetching BIN ${bin} from NeutrinoAPI:`, error);
    throw error;
  }
}

async function binAPI(req, res) {
  const { binArray } = req.body;
  const results = [];

  for (const bin of binArray) {
    try {
      console.log(`Processing BIN ${bin} using ${apiToggle ? "APILayer" : "NeutrinoAPI"}`);
      
      // Fetch data from the selected API based on apiToggle
      const result = apiToggle ? await fetchFromAPILayer(bin) : await fetchFromNeutrinoAPI(bin);
      apiToggle = !apiToggle; // Toggle the API for the next request

      const newBin = new Bintable({
        bin,
        cardType: result[0],
        country: result[1],
      });

      await newBin.save();
      console.log(`BIN ${bin} processed successfully`);
    } catch (error) {
      console.error(`Primary API failed for BIN ${bin}, trying fallback API:`, error);
      try {
        // Log fallback attempt
        console.log(`Attempting fallback API for BIN ${bin} using ${apiToggle ? "NeutrinoAPI" : "APILayer"}`);

        // Try the fallback API if the primary one fails
        const fallbackResult = apiToggle ? await fetchFromNeutrinoAPI(bin) : await fetchFromAPILayer(bin);
        apiToggle = !apiToggle; // Toggle the API for the next request

        const newBin = new Bintable({
          bin,
          cardType: fallbackResult[0],
          country: fallbackResult[1],
        });

        await newBin.save();
        console.log(`BIN ${bin} processed successfully with fallback API`);
      } catch (fallbackError) {
        console.error(`Both APIs failed for BIN ${bin}:`, fallbackError);
        results.push({ bin, error: `Failed to process BIN ${bin}` }); // Track error for this bin
      }
    }
  }

  // Check for any errors and send the response
  const failedBins = results.filter(result => result && result.error);
  if (failedBins.length > 0) {
    res.status(500).json({ message: "Some BINs failed to process", failedBins });
  } else {
    res.status(200).json({ message: "All BINs processed successfully" });
  }
}


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

    const lastProcessedRecord = await LiveTransactionTable.findOne().sort({
      livedata_id: -1,
    });
    const maxId = lastProcessedRecord ? lastProcessedRecord.livedata_id : 1;

    const newRecords = [];
    const updatedRecords = [];

    for (const item of data) {
      if (item.id > maxId) {
        newRecords.push({
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
            is_redirect: item.is_redirect === null ? "No" : "Yes",
        });
      } else {
        const existingRecord = await LiveTransactionTable.findOne({ livedata_id: item.id });
        if (existingRecord && existingRecord.Status !== item.status) {
          updatedRecords.push({
            updateOne: {
              filter: { livedata_id: item.id },
              update: { Status: item.status },
            },
          });
        }
      }
    }

    if (newRecords.length > 0) {
      await LiveTransactionTable.insertMany(newRecords);
    }

    if (updatedRecords.length > 0) {
      await LiveTransactionTable.bulkWrite(updatedRecords);
    }

    if (req && res) {
      res.json({ newRecords, updatedRecords });
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
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({ error: "Missing fromDate or toDate in request body" });
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

    const from = fromDate;
    const to = toDate;

    const deleteResult = await LiveTransactionTable.deleteMany({
      transactiondate: {
        $gte: from,
        $lte: to
      }
    });

    const bulkOps = data.map((item) => ({
      updateOne: {
        filter: { livedata_id: item.id },
        update: {
          $set: {
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
            is_redirect: item.is_redirect === null ? "No" : "Yes",
          }
        },
        upsert: true
      }
    }));

    const bulkWriteResult = await LiveTransactionTable.bulkWrite(bulkOps);

    res.json({ 
      success: true, 
      message: "Transactions updated successfully",
      deletedCount: deleteResult.deletedCount,
      insertedCount: bulkWriteResult.upsertedCount
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

module.exports = { getLivedata, fetchTransactionsAndUpdate, searchTransactions, getLatestTransactions, bankSettled ,binAPI};