const uploadRouter = require('express').Router();

const axios = require('axios');
const XLSX = require('xlsx');
const Mailjet = require('node-mailjet');
const jwt = require('jsonwebtoken')

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
  
uploadRouter.post('/', (req, res) => {
    if (!req.body.list || !req.body.configuration || !req.body.template) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
        res.status(401).json({ error: 'token invalid' })
    }

    const configuration = JSON.parse(req.body.configuration);
    const list = JSON.parse(req.body.list);
    const template = req.body.template;
    const campaignDesc = req.body.campaignDesc;
    const orgName = req.body.orgName;
    const narrative = req.body.narrative;
    const donateLink = req.body.donateLink;
    const deliveryMethod = req.body.deliveryMethod;

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
                const request = mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                    {
                        From: {
                        Email: "info@smartraiser.ai",
                        Name: "SmartRaiser"
                        },
                        To: [
                        {
                            Email: email,
                            Name: name
                        }
                        ],
                        TemplateID: 4847744,
                        TemplateLanguage: true,
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

            request
            .then((result) => {
                console.log(result.body)
            })
            .catch((err) => {
                console.log(err.statusCode)
            })
            }
        } else if (deliveryMethod === 'text') {
            const num = obj.phoneNumber.replace(/-/g,'');
            if(num === undefined || !Number.isInteger(Number(num))) {
                console.log('no number! delivery aborted')
            } else {
                client.messages
                .create({ body: template, from: "+18885459281", to: `+1${num}` })
                .then(message => console.log(message.sid));
            }
        }
    })
    res.json({ data: combinedData, message: "File upload successful"});
});

module.exports = uploadRouter;