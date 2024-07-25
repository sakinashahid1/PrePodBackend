const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
    approvalRatio,
    ApprovalRatioChart,
    volumeSum,
    listSettlement,
    getCompanyList,
    getCurrenciesOfCompany,
    companyCurrency,
    countriesList,
    midList,
  merchantKeys,
  acquirerList,
} = require("../controllers/utilitycontroller");

const router = express.Router();
router.get("/volumesum", verifyToken, volumeSum);
router.get("/approval-ratios-chart", ApprovalRatioChart);
router.get("/listsettlement", verifyToken, listSettlement);
router.get("/companylist", verifyToken, getCompanyList);
router.get("/currenciesforcompany", verifyToken, getCurrenciesOfCompany);
router.get("/approvalratio", verifyToken, approvalRatio);
router.get("/listofcountries", verifyToken, countriesList);
router.get("/listofmids", verifyToken, midList);
router.get("/acquirerlist", verifyToken, acquirerList);
router.get("/uniquecurrencies", verifyToken, companyCurrency);
router.get("/merchantkeys", verifyToken, merchantKeys )

module.exports = router;