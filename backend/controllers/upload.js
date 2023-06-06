const uploadRouter = require('express').Router();

const axios = require('axios');
const XLSX = require('xlsx');
const Mailjet = require('node-mailjet');
const jwt = require('jsonwebtoken')
const {Agenda} = require('@hokify/agenda');
const { userExtractor } = require('../utils/middleware');

//Agenda Job Scheduling Configuration
const agenda = new Agenda({ db: { address: process.env.MONGO } });

//OpenAI Configuration
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY}`,
}
const apiUrl="https://api.openai.com/v1/completions";

//Twilio Configuration
const accountSid = process.env.ACC_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//Mailjet Configuration
const mailjet = Mailjet.apiConnect(
    process.env.MJ_API_PUB_KEY || 'your-api-key',
    process.env.MJ_API_PRIV_KEY || 'your-api-secret',
    {
        config: {},
        options: {}
    }
);
  
uploadRouter.post('/', userExtractor, async (req, res) => {
    if (!req.body.list || !req.body.configuration || !req.body.template) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
        res.status(401).json({ error: 'token invalid' })
    }
    const configuration = JSON.parse(req.body.configuration);
    const list = JSON.parse(req.body.list);
    const templateObj = JSON.parse(req.body.template);
    const template = templateObj.template;
    const campaignDesc = templateObj.campaignDesc;
    const orgName = templateObj.orgName;
    const narrative = templateObj.narrative;
    const donateLink = templateObj.donateLink;
    const deliveryMethod = req.body.deliveryMethod;
    const date = req.body.date;

    // Combine the list data with the configuration
    const combinedData = list.list.map((row) => {
        const combinedRow = {};

        try {
        Object.entries(configuration.columnMappings).forEach(([index, mappedColumnName]) => {
            const columnIndex = parseInt(index, 10);
            const columnName = Object.keys(row)[columnIndex];

            if (columnName !== undefined && row[columnName] !== undefined) {
            combinedRow[mappedColumnName] = row[columnName];
            }
        });
        } catch (error) {
        console.error('Error in Row:', row);
        throw error;
        }

        return combinedRow;
    });

    // Iterate through the array of combined data
    combinedData.map((obj, index) => {
        const name = obj.fullName;
        if(deliveryMethod === 'email')
            {
            const email = obj.emailAddress;
            if(email === undefined) {
                console.log('no email! delivery aborted')
            } else {
                try {
                    if (date !== 'null') {
                        agenda.define('send email campaign', async job => {
                            await mailjet
                            .post('send', { version: 'v3.1' })
                            .request({
                                Messages: [
                                {
                                    From: {
                                    Email: "info@smartraiser.ai",
                                    Name: orgName
                                    },
                                    To: [
                                    {
                                        Email: email,
                                        Name: name
                                    }
                                    ],
                                    TemplateID: 4847744,
                                    TemplateLanguage: true,
                                    CustomCampaign: req.user._id,
                                    Subject: `${orgName} Needs Your Help!`,
                                    Variables: {
                                        msg: template,
                                        orgName: orgName,
                                        donateLink: donateLink
                                    },
                                    TemplateErrorReporting: {
                                        Email: "phil@smartraiser.ai",
                                        Name: "Phil LeClair"
                                    }
                                }
                                ]
                            })
                            .then((result) => {
                                console.log(result.body)
                            })
                            .catch((err) => {
                                console.log(err.statusCode)
                            })
                        });
                        (async function () {
                            await agenda.start();
                            await agenda.schedule(date, 'send email campaign',{ id:req.user._id, deliveryMethod:deliveryMethod, scheduled:true });
                        })();
                    } else {
                        agenda.define('send email campaign', async job => {
                            await mailjet
                            .post('send', { version: 'v3.1' })
                            .request({
                                Messages: [
                                {
                                    From: {
                                    Email: "info@smartraiser.ai",
                                    Name: orgName
                                    },
                                    To: [
                                    {
                                        Email: email,
                                        Name: name
                                    }
                                    ],
                                    TemplateID: 4847744,
                                    TemplateLanguage: true,
                                    CustomCampaign: req.user.id,
                                    Subject: `${orgName} Needs Your Help!`,
                                    Variables: {
                                        msg: template,
                                        orgName: orgName,
                                        donateLink: donateLink
                                    },
                                    TemplateErrorReporting: {
                                        Email: "phil@smartraiser.ai",
                                        Name: "Phil LeClair"
                                    }
                                }
                                ]
                            })
                            .then((result) => {
                                console.log(result.body)
                            })
                            .catch((err) => {
                                console.log(err.statusCode)
                            })
                        });
                        (async function () {
                            await agenda.start();
                            await agenda.now('send email campaign',{ id:req.user._id, deliveryMethod:deliveryMethod, scheduled:false });
                        })();
                    }                    
                } catch (err) {
                    console.log('error sending email:', err)
                }
            }
        } else if (deliveryMethod === 'text') {
            let num;
            if (obj.phoneNumber === undefined)
                return
            else
                num = obj.phoneNumber.replace(/-/g,'');
            if(num === undefined || !Number.isInteger(Number(num))) {
                console.log('no number! delivery aborted')
            } else {
                try {
                    if (date !== 'null') {
                        agenda.define('send text campaign', async job => {
                            await client.messages
                            .create({
                                messagingServiceSid: process.env.TWILIO_MSG_SID, 
                                body: template, from: "+18885459281", to: `+1${num}`,
                                statusCallback: 'https://app.smartraiser.ai/api/upload/callback', provideFeedback: true,
                            })
                            .then(message => console.log(message.status));
                        });
                        (async function () {
                            await agenda.start();
                            await agenda.schedule(date, 'send text campaign',{ id:req.user._id, deliveryMethod:deliveryMethod, scheduled:true });
                        })();
                    } else {
                        agenda.define('send text campaign', async job => {
                            await client.messages
                            .create({ body: template, from: "+18885459281", to: `+1${num}`,
                            statusCallback: 'https://app.smartraiser.ai/api/upload/callback', provideFeedback: true,
                            })
                            .then(message => console.log(message.status));
                        });
                        (async function () {
                            await agenda.start();
                            await agenda.now('send text campaign',{ id:req.user._id, deliveryMethod:deliveryMethod, scheduled:false });
                        })();
                    }
                } catch (err) {
                    console.log('error sending text:', err)
                }
            }
        }
    })
    res.json({ data: combinedData, message: "File upload successful"});
});

uploadRouter.post('/callback', async (req,res) => {
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;

    client.messages(messageSid)
      .feedback
      .create({outcome: 'confirmed'})
      .then(feedback => console.log(feedback.messageSid));
})

module.exports = uploadRouter;