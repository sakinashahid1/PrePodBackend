require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const http = require('http');
// const WebSocket = require('ws');

const ClientRoutes = require("./src/routes/clientroute");
const UserRoutes = require("./src/routes/userroute");
const SessionRoutes = require("./src/routes/sessionsroute");
const AcquirerRoutes = require("./src/routes/acquirerroute");
const TransactiontableRoutes = require("./src/routes/transactiontableroute");
const RatetableRoutes = require("./src/routes/ratetableroute");
const SettlementtableRoutes = require("./src/routes/settlementroute");
const BusinesstypeRoutes = require("./src/routes/businesstyperoute");
const CategoryRoutes = require("./src/routes/categoryroute");
const CreatecurrencyRoutes = require("./src/routes/createcurrencyroute");
const DocumenttypeRoutes = require("./src/routes/documenttyperoute");
const CreatebankRoutes = require("./src/routes/createbankroute");
const BusinesssubcategoryRoutes = require("./src/routes/businesssubcategoryroute");
const DocumentcategoryRoutes = require("./src/routes/documentcategoryroute");
const TransactionreportRoutes = require("./src/routes/transactionreportroute");
const LiveTransactionData = require("./src/routes/livetransactiontableroute");
const DashboardCardRoutes = require("./src/routes/dashboardroute");
const NewRoutes = require("./src/routes/newroute");
const TransactionFlowRoutes = require("./src/routes/TransactionFlowroute");
const UtilityRoutes = require("./src/routes/utilityroute");

require("./src/config/database");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Welcome! The pre production server is running");
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/", ClientRoutes);
app.use("/", UserRoutes);
app.use("/", SessionRoutes);
app.use("/", AcquirerRoutes);
app.use("/", TransactiontableRoutes);
app.use("/", RatetableRoutes);
app.use("/", SettlementtableRoutes);
app.use("/", BusinesstypeRoutes);
app.use("/", CategoryRoutes);
app.use("/", CreatecurrencyRoutes);
app.use("/", DocumenttypeRoutes);
app.use("/", CreatebankRoutes);
app.use("/", BusinesssubcategoryRoutes);
app.use("/", DocumentcategoryRoutes);
app.use("/", TransactionreportRoutes);
app.use("/", DashboardCardRoutes);
app.use("/", LiveTransactionData);
app.use("/", NewRoutes);
app.use("/", TransactionFlowRoutes);
app.use("/", UtilityRoutes)

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
// let wsConnection = null;

// wss.on('connection', (ws) => {
//     wsConnection = ws;
//     ws.on('message', (message) => {
//         console.log('received: %s', message);
//     });
// });

module.exports = { server, wsConnection };

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
