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
    try {
        //twilio client
        const client = require("twilio")(accountSid, authToken, { accountSid: req.user.accSid });
        
        //get mailjet campaigns
        const request = await mailjet
            .get("campaignoverview", {'version': 'v3'})
            .request()
        const emailStats = request.body.Data
            .filter((campaign) => {
                const filtered = req.user.campaigns.filter((userCampaign) => {
                    if (userCampaign === campaign.Title)
                        return userCampaign
                })
                if (filtered.length > 0)
                    return campaign
        })
        // const templates = await mailjet
        //     .get("template", {'version': 'v3'})
        //     .request()
        // console.log(templates.body.Data)
        const allMessages = await client.messages.list()
        const messages = allMessages.filter((msg) => {
            if (msg.from === req.user.phoneNum)
                return msg
        })
        res.status(200).json({emailStats,messages})
    } catch (error) {
        next(error)
    }
})

module.exports = statsRouter