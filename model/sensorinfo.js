const mongoose = require("mongoose");

const sensorinfo = new mongoose.Schema(
  {
    polyhsid: { type: String, required: true },
    temp: { type: String, required: true },
    humidity: { type: String, required: true },
    moisture: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    collection: "sensor_info",
  }
);

const sensorinfoModel = mongoose.model("sensorinfo", sensorinfo);

module.exports = sensorinfoModel;
