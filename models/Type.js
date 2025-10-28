const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true,index: true },
  logo: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Type', typeSchema);