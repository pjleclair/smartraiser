const statsRouter = require('express').Router()
const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    process.env.MJ_API_PUB_KEY || 'your-api-key',
    process.env.MJ_API_PRIV_KEY || 'your-api-secret',
    {
        config: {},
        options: {}
    }
);

statsRouter.get('/', async (req,res,next) => {
    try {
        const request = await mailjet
            .get("campaignoverview", {'version': 'v3'})
            .request()
        res.status(200).json(request.body)
    } catch (error) {
        next(error)
    }
})

module.exports = statsRouter