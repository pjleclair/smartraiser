const mongoose = require('mongoose');

// Create a Schema for configurations
const listSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        required: true
    },
    list: Array,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
  });

module.exports = mongoose.model('List',listSchema);