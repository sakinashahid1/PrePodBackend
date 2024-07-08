const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  email: { type: String },
  company_name: { type: String },
  login_time: { type: Number },
  logout_time: { type: Number },
  sessionDuration: { type: String },
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
