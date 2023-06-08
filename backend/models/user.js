const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Create a Schema for users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    passwordHash: String,
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List'
      }
    ],
    configurations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Configuration'
      }
    ],
    templates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
      }
    ],
    accSid: String,
    accToken: String,
    phoneNum: String,
    domain: String,
    orgName: String,
    campaigns: Array,    
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);