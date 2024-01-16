const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true },
  },
  {
    collection: "users",
  }
);

const userModel = mongoose.model("userSchema", userSchema);

module.exports = userModel;
