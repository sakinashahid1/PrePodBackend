require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");
const Bintable = require("../models/BinTable")

let apiToggle = true;

async function fetchFromBinCheck(bin) {
    try {
        console.log(`Fetching BIN ${bin} from Bin Check`);
        const response = await fetch(`https://bin-ip-checker.p.rapidapi.com/?bin=${bin}`, {
            method: "POST",
            headers: {
                'x-rapidapi-key': '4403aa3601msh220f59b21e3c805p19213fjsn4267c5dcd8f3',
                'x-rapidapi-host': 'bin-ip-checker.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "bin": bin })
        });

        if (!response.ok) {
            throw new Error(`Bin Check response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        return [data.BIN["scheme"], data.BIN.country["name"]];
    } catch (error) {
        console.error(`Error fetching BIN ${bin} from Bin Check:`, error);
        throw error;
    }
}

async function fetchFromNeutrinoAPI(bin) {
    try {
        console.log(`Fetching BIN ${bin} from NeutrinoAPI`);
        const response = await fetch(`https://neutrinoapi.net/bin-lookup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-ID": "CP",
                "API-Key": "fecWnLZycWuztVKb3inFb46QiuuBpkdcZWMbXD65IqX1gqX2"
            },
            body: JSON.stringify({ "bin-number": bin })
        });

        if (!response.ok) {
            throw new Error(`Neutrino API response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.valid) {
            return [data["card-brand"], data.country];
        } else {
            throw new Error(`Neutrino API response was invalid`);
        }

    } catch (error) {
        console.error(`Error fetching BIN ${bin} from NeutrinoAPI:`, error);
        throw error;
    }
}

async function binAPI(req, res) {
    const { bin } = req.body;
    const binStartTime = Date.now();
    console.log(`Timestamp for ${bin} is ${binStartTime}`)
    let binProcessingTime = 0;
    let apiName = "";
    let attemptType = "First Try";

    try {
        let result;
        if (apiToggle) {
            apiName = "Bin Check";
            result = await fetchFromBinCheck(bin);
        } else {
            apiName = "NeutrinoAPI";
            result = await fetchFromNeutrinoAPI(bin);
        }

        apiToggle = !apiToggle; // Toggle the API for the next request

        // Calculate the time taken for this BIN
        const binEndTime = Date.now();
        binProcessingTime = binEndTime - binStartTime;

        const newBin = new Bintable({
            bin,
            timeTaken: binProcessingTime,
            apiUsed: apiName,
            attempt: attemptType,
            cardType: result[0],
            country: result[1],
        });

        await newBin.save();
        const data = {
            cardType: result[0],
            country: result[1]
        }
        res.status(200).json({
            code:200,
            status:"Success",
            data: data
        });

    } catch (error) {
        console.error(`Error processing BIN ${bin}:`, error);

        // Attempt fallback with the opposite API
        try {
            attemptType = "Fallback";
            let fallbackResult;
            if (!apiToggle) { // Flip the logic to use the opposite API of the failed one
                apiName = "NeutrinoAPI";
                fallbackResult = await fetchFromNeutrinoAPI(bin);
            } else {
                apiName = "Bin Check";
                fallbackResult = await fetchFromBinCheck(bin);
            }

            // No need to toggle the apiToggle here again because it's already the opposite from before

            // Calculate the time taken for this BIN
            const binEndTime = Date.now();
            binProcessingTime = binEndTime - binStartTime;
            const newBin = new Bintable({
                bin,
                timeTaken: binProcessingTime,
                apiUsed: apiName,
                attempt: attemptType,
                cardType: fallbackResult[0],
                country: fallbackResult[1],
            });

            const data = {
                cardType: fallbackResult[0],
                country: fallbackResult[1]
            }
            await newBin.save();

            res.status(200).json({
              code:200,
              status:"Success",
                data: data
            });

        } catch (fallbackError) {
            console.error(`Fallback error processing BIN ${bin}:`, fallbackError);
            res.status(500).json({
              code:400,
              status:"Failed",
                error: fallbackError.message,
            });
        }
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
        //Apply code for finding bin
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