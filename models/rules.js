const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  string: { type: String, required: true },
  node: { type: Object, required: true } // Stores the AST tree node for the rule
});

module.exports = mongoose.model('Rule', ruleSchema);