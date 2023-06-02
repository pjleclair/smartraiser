const mongoose = require('mongoose');

// Create a Schema for configurations
const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        required: true
    },
    template: String,
    campaignDesc: String,
    orgName: String,
    narrative: String,
    donateLink: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
  });

module.exports = mongoose.model('Template',templateSchema);