const statsRouter = require('express').Router()
const Mailjet = require('node-mailjet');
const { userExtractor } = require('../utils/middleware');
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
        const request = await mailjet
            .get("campaignoverview", {'version': 'v3'})
            .request()
        const emailStats = request.body.Data.filter((campaign) => {
            if (campaign.Title === req.user._id.toString())
                return campaign
        })
        res.status(200).json(emailStats)
    } catch (error) {
        next(error)
    }
})

module.exports = statsRouter