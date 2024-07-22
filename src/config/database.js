const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
    autoIndex: false // Disable automatic index creation
  });
