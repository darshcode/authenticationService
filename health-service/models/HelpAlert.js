// models/HelpAlert.js
const mongoose = require("mongoose");

const HelpAlertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String }, // optional: "I need help"
  viewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HelpAlert", HelpAlertSchema);
