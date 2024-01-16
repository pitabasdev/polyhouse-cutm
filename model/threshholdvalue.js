const mongoose = require("mongoose");

const threshholdschema = new mongoose.Schema(
  {
    re_temp: { type: String, required: true },
    re_humidity: { type: String, required: true },
    re_soilmoisture: { type: String, required: true },
  },
  {
    collection: "threshholdvalue",
  }
);

const threshholdvaluemodel = mongoose.model("threshhold", threshholdschema);

module.exports = threshholdvaluemodel;
