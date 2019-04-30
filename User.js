const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    userId: {type: String, unique: true, required: true}
})

module.exports = mongoose.model('User', UserSchema);