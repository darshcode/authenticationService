const mongoose = require("mongoose");

const SymptomRecordSchema = new mongoose.Schema({
  PatientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symptoms: {
    type: [String],
    required: true,
    enum: [
      "fever",
      "cough",
      "shortness_of_breath",
      "fatigue",
      "sore_throat",
      "body_aches",
      "congestion",
      "runny_nose",
    ],
  },
  submissionDate: { type: Date, default: Date.now },
  aiPrediction: {
    condition: {
      type: String,
      enum: ["COVID-19"],
    },
    probability: { type: Number },
    severity: {
      type: String,
      enum: ["none", "mild", "moderate", "severe", "unknown"],
    },
    riskLevel: { type: String, enum: ["low", "medium", "high", "unknown"] },
  },
});

module.exports = mongoose.model("SymptomRecord", SymptomRecordSchema);
