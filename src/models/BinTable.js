const mongoose = require("mongoose");

const bintableSchema = new mongoose.Schema({
  bin: { type: String },
  cardType:  { type: String },
  country: { type: String },
});

const Bintable = mongoose.model("Bintable", bintableSchema);

module.exports = Bintable;
