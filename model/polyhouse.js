const mongoose = require("mongoose");

const polyhouse = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
  },
  {
    collection: "polyhouse",
  }
);

const polyhousemodel = mongoose.model("polyhouse", polyhouse);

module.exports = polyhousemodel;
