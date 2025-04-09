const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MotivationSchema = new Schema({
    PatientID:{type: Schema.Types.ObjectId,ref:'User', required: true},
    NurseID:{type: Schema.Types.ObjectId,ref:'User', required: true},
    title:{type: String, required: true},
    content:{type: String, required: true},

    timeStamp:{type: Date, required: true}
});

module.exports = mongoose.model('Motivation', MotivationSchema);