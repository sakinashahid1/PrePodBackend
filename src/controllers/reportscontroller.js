require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

async function searchTransactionReport(req, res) {
  try {
    const {
      searchIds,
      status,
      merchant,
      fromDate,
      toDate,
      mid,
      paymentgateway,
      currency,
      country,
      cardtype,
      cardnumber,
    } = req.body;

    const pipeline = [];

    if (fromDate && toDate) {
      pipeline.push({
        $match: {
          transactiondate: {
            $gte: fromDate.replace("T", " "),
            $lte: toDate.replace("T", " "),
          },
        },
      });
    }

    if (status) {
      pipeline.push({
        $match: {
          Status: { $regex: new RegExp(`^${status}$`, "i") },
        },
      });
    }

    if (merchant) {
      pipeline.push({
        $match: {
          merchant: { $regex: new RegExp(`^${merchant}$`, "i") },
        },
      });
    }

    if (mid) {
      pipeline.push({
        $match: {
          mid: { $regex: new RegExp(`^${mid}$`, "i") },
        },
      });
    }

    if (paymentgateway) {
      pipeline.push({
        $match: {
          paymentgateway: { $regex: new RegExp(`^${paymentgateway}$`, "i") },
        },
      });
    }

    if (currency) {
      pipeline.push({
        $match: {
          currency: { $regex: new RegExp(`^${currency}$`, "i") },
        },
      });
    }

    if (country) {
      pipeline.push({
        $match: {
          country: { $regex: new RegExp(`^${country}$`, "i") },
        },
      });
    }

    if (cardtype) {
      pipeline.push({
        $match: {
          cardtype: { $regex: new RegExp(`^${cardtype}$`, "i") },
        },
      });
    }

    if (cardnumber) {
      pipeline.push({
        $match: {
          cardnumber: cardnumber,
        },
      });
    }

    if (searchIds) {
      pipeline.push({
        $match: {
          $or: [
            { txnid: { $in: searchIds.split(" ") } },
            { merchantTxnId: { $in: searchIds.split(" ") } },
          ],
        },
      });
    }

    const transactions = await LiveTransactionTable.aggregate(pipeline);
    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function compareReport(req, res) {
  try {
    const { fromDate, toDate, paymentgateway } = req.body;
    console.table({ fromDate, toDate, paymentgateway });

    const timezoneOffsets = {
      "MilkyPay": 4,
      "Arca":5.5,
      "Neonpay":5.5
    };
const ISToffset = 5.5;
    const bankoffset = timezoneOffsets[paymentgateway];
    const offset = ISToffset - bankoffset
    console.log(offset);
console.log(typeof fromDate)
    const fromTime = new Date(fromDate);
    const toTime = new Date(toDate);

console.table({fromTime, toTime})
    const adjustedFromTime = adjustTimeToOffset(fromTime, offset);
    const adjustedToTime = adjustTimeToOffset(toTime, offset);

    const pipeline = [
      {
        $match: {
          transactiondate: {
            $gte: adjustedFromTime,
            $lte: adjustedToTime,
          },
          paymentgateway: { $regex: new RegExp(`^${paymentgateway}$`, 'i') },
        },
      },
      {
        $sort: { transactiondate: -1 }
      },
      {
        $project: {
          txnid: 1,
          Status: 1,
          amount: 1,
          transactiondate: 1,
          _id: 0
        }
      }
    ];

    console.table({ adjustedFromTime, adjustedToTime });

    const transactions = await LiveTransactionTable.aggregate(pipeline);
    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function adjustTimeToOffset(time, offset) {
  const date = new Date( time );
  console.log("date",date)
  console.log("type date",typeof date)

  const newDate = new Date(date.getTime() + (offset * 60 * 60 * 1000));

  const formattedDate = `${newDate.getFullYear()}-${(
    "0" + (newDate.getMonth() + 1)
  ).slice(-2)}-${("0" + newDate.getDate()).slice(-2)} ${(
    "0" + newDate.getHours()
  ).slice(-2)}:${("0" + newDate.getMinutes()).slice(-2)}:${(
    "0" + newDate.getSeconds()
  ).slice(-2)}`;

  return formattedDate;
}

async function searchSettledTransactions(req, res) {
  try {
    const {
      searchIds,
      status,
      merchant,
      fromDate,
      toDate,
      mid,
      paymentgateway,
      currency,
      country,
      cardtype,
      cardnumber,
      isBankSettled,
    } = req.body;

    const pipeline = [];

    if (fromDate && toDate) {
      pipeline.push({
        $match: {
          transactiondate: {
            $gte: fromDate.replace("T", " "),
            $lte: toDate.replace("T", " "),
          },
        },
      });
    }

    if (status) {
      pipeline.push({
        $match: {
          Status: { $regex: new RegExp(`^${status}$`, "i") },
        },
      });
    }

    if (merchant) {
      pipeline.push({
        $match: {
          merchant: { $regex: new RegExp(`^${merchant}$`, "i") },
        },
      });
    }

    if (mid) {
      pipeline.push({
        $match: {
          mid: { $regex: new RegExp(`^${mid}$`, "i") },
        },
      });
    }

    if (paymentgateway) {
      pipeline.push({
        $match: {
          paymentgateway: { $regex: new RegExp(`^${paymentgateway}$`, "i") },
        },
      });
    }

    if (currency) {
      pipeline.push({
        $match: {
          currency: { $regex: new RegExp(`^${currency}$`, "i") },
        },
      });
    }

    if (country) {
      pipeline.push({
        $match: {
          country: { $regex: new RegExp(`^${country}$`, "i") },
        },
      });
    }

    if (cardtype) {
      pipeline.push({
        $match: {
          cardtype: { $regex: new RegExp(`^${cardtype}$`, "i") },
        },
      });
    }

    if (cardnumber) {
      pipeline.push({
        $match: {
          cardnumber: cardnumber,
        },
      });
    }

    if (searchIds) {
      pipeline.push({
        $match: {
          $or: [
            { txnid: { $in: searchIds.split(" ") } },
            { merchantTxnId: { $in: searchIds.split(" ") } },
          ],
        },
      });
    }

    if (isBankSettled) {
      pipeline.push({
        $match: {
          isBankSettled: isBankSettled
        }
      })
    }

    pipeline.push({
      $project: {
        _id: 0, 
        txnid: 1,
        amount: 1,
        merchant: 1,
        paymentgateway: 1,
        Status: 1,
        isBankSettled: 1
      }
    });

    const transactions = await LiveTransactionTable.aggregate(pipeline)
    res.json(transactions);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function quickSearch(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Search value is required" });
  }

  try {
    const transaction = await LiveTransactionTable.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  searchTransactionReport,
  compareReport,
  quickSearch,
  searchSettledTransactions
};
