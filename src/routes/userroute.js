const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  signup,
  getLoginCredentials,
  getUserDetails,
  updateUser,userShortcut, getUserShortcuts, deleteUserShortcuts,
} = require("../controllers/userscontroller");

const router = express.Router();

// Define user routes
router.post("/signup", signup);
router.get("/logincredentials", verifyToken, getLoginCredentials);
router.get("/getuserdetails", verifyToken, getUserDetails);
router.patch("/updateUser", verifyToken, updateUser);
router.post("/usershortcut", verifyToken, userShortcut)
router.get("/getshortcuts", verifyToken, getUserShortcuts);
router.delete("/deleteshortcut", verifyToken, deleteUserShortcuts);

module.exports = router;