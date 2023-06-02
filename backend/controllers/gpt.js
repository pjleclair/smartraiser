const gptRouter = require('express').Router();

const axios = require('axios');
const jwt = require('jsonwebtoken')

//OpenAI Configuration
const {Configuration, OpenAIApi} = require('openai')
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})
const openai = new OpenAIApi(configuration);
  
gptRouter.post('/', async (req, res) => {
    if (!req.body.campaignDesc || !req.body.orgName || !req.body.narrative) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
        res.status(401).json({ error: 'token invalid' })
    }

    const campaignDesc = req.body.campaignDesc;
    const orgName = req.body.orgName;
    const narrative = req.body.narrative;
    const donateLink = req.body.donateLink;

    //make API call to OpenAI
    let msgArray = new Array(2).fill(0);
    try {
        const gptArray = await Promise.all(msgArray.map( async (obj,i)=> {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: `Pretend you are working for a ${campaignDesc} campaign named "${orgName}". Compose JUST the body of a compelling fundraising message for a ${campaignDesc} campaign named "${orgName}" targeting US citizens, with the goal of encouraging donations. Tailor the content based on ${narrative} and consider the recipient's interests and values. Include a shortened hyperlink (${donateLink}) for easy donation. Do NOT open your response with a salutation addressing your recipient or audience, and do NOT sign the message. Your response should be HTML.`}],
            })

            return completion.data.choices[0].message;
            
        }))
        console.log(gptArray)
        res.json({message: "Campaign drafting successful", gpt: gptArray});
    } catch (error) {
        console.log(error)
        res.json({error: error})
    }
});

module.exports = gptRouter;