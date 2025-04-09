const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VitalSignsSchema = new Schema({
  PatientID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  NurseID: { type: Schema.Types.ObjectId, ref: "User" },
  Temperature: { type: Number, required: true },
  BPsystolic: { type: Number, required: true },
  BPdiastolic: { type: Number, required: true },
  RespiratoryRate: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  weight: { type: Number, required: true },
  notes: { type: String },
  timeStamp: { type: Date, required: true },
});
module.exports = mongoose.model("VitalSigns", VitalSignsSchema);
