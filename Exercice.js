const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExerciceSchema = new Schema({
    username: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now, required: true},
    duration: {type: Number, required: true}

});

module.exports = mongoose.model('Exercice', ExerciceSchema);
