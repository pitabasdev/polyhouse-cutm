const mongoose = require("mongoose");

const threshhold = new mongoose.Schema(
  {
    re_temp: { type: String, required: true },
    re_humidity: { type: String, required: true },
    re_soilmoisture: { type: String, required: true },
  },
  {
    collection: "threshhold",
  }
);

const threshholdmodel = mongoose.model("threshhold", threshhold);

module.exports = threshholdmodel;
