const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  string: { type: String, required: true } // Store raw data or JSON string
});

module.exports = mongoose.model('Data', dataSchema);
