const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

const accountSid = process.env.ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let client = require("twilio")(accountSid, authToken);

usersRouter.post('/', async (req, res) => {
    const {username,name,password} = req.body;
    const existingUser = await User.findOne({username})
    if (
        !(username && password)
        || (username.length < 3)
    ) {
        return res.status(500).json({error: "invalid username or password"})
    } 
        else if ((existingUser !== null)) 
    {
        return res.status(500).json({error: "user exists already, please login"})
    }
    const account = await client.api.v2010.accounts
                .create({friendlyName: name})
    const accSid = account.sid;
    const accToken = account.authToken;

    client = require("twilio")(accountSid, authToken, { accountSid: accSid });

    const availNums = await client.availablePhoneNumbers('US')
            .tollFree
            .list({limit: 1})    
    const numObj = await client.incomingPhoneNumbers
            .create({phoneNumber: availNums[0].phoneNumber})
            
    const phoneNum = numObj.phoneNumber;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
        username,
        name,
        passwordHash,
        accSid,
        accToken,
        phoneNum
    })

    const savedUser = await user.save();

    res.status(201).json(savedUser)
});

usersRouter.get('/', (req, res) => {
    User.find({}).populate('configurations', {name: 1, columnMappings: 1})
      .then((users) => {
        res.json(users);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch users:', error});
      });
  });

module.exports = usersRouter;