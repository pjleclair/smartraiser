const statsRouter = require('express').Router()
const Mailjet = require('node-mailjet');
const { userExtractor } = require('../utils/middleware');

//Twilio Configuration
const accountSid = process.env.ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

//Mailjet Configuration
const mailjet = Mailjet.apiConnect(
    process.env.MJ_API_PUB_KEY || 'your-api-key',
    process.env.MJ_API_PRIV_KEY || 'your-api-secret',
    {
        config: {},
        options: {}
    }
);

statsRouter.get('/', userExtractor, async (req,res,next) => {
    //twilio client
    const client = require("twilio")(accountSid, authToken, { accountSid: req.user.accSid });

    try {
        const request = await mailjet
            .get("campaignoverview", {'version': 'v3'})
            .request()
        const emailStats = request.body.Data
        //     .filter((campaign) => {
        //     if (campaign.Title === req.user._id.toString())
        //         return campaign
        // })
        const messages = await client.messages.list()
        res.status(200).json({emailStats,messages})
    } catch (error) {
        next(error)
    }
})

module.exports = statsRouter