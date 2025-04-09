const mongoose = require("mongoose");

const MotivationCardSchema = new mongoose.Schema({
  Topic: { type: String, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("MotivationCard", MotivationCardSchema);
