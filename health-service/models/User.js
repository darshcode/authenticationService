const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for User
const UserSchema = new Schema({
    
    NurseID:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    PatientID:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    role:{type: String, required: true,enum:['patient','nurse']},
    name:{type: String, required: true},
});
module.exports = mongoose.model('User', UserSchema);