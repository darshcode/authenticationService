// models/alert.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
  id: { type: Schema.Types.ObjectId },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  description: { type: String, required: true },
  timeStamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
