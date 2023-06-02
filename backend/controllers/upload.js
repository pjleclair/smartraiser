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
    if (!req.body.list || !req.body.configuration) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
        res.status(401).json({ error: 'token invalid' })
    }

    const configuration = JSON.parse(req.body.configuration);
    const list = JSON.parse(req.body.list)
    const campaignDesc = req.body.campaignDesc;
    const orgName = req.body.orgName;
    const narrative = req.body.narrative;
    const donateLink = req.body.donateLink;
    const deliveryMethod = req.body.deliveryMethod;

    console.log(list)
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

    console.log(combinedData)

    //make API call to OpenAI
    // let msgArray = [];
    // const promises = Array.from(combinedData, (obj, index) => {
    //     console.log(obj)
    //     let data
    //     if (deliveryMethod === 'text') {
    //         data={
    //         "model": "text-davinci-003",
    //         //"prompt": `Create a fundraising text message addressed to ${obj.fullName} for a ${campaignDesc} campaign named "${orgName}" based on ${narrative} that targets US citizens of age ${obj.age} that are members of the ${obj.party} political party - be sure to include a shortened hyperlink to donate at ${donateLink} and address the recipient by first name, but do not explicitly mention age or political party, just use those parameters to tailor your content.`,
    //         "prompt": `Pretend you are working for a ${campaignDesc} campaign named "${orgName}". Compose a compelling fundraising text message for a ${campaignDesc} campaign named "${orgName}" targeting US citizens, with the goal of encouraging donations. Tailor the content based on ${narrative} and consider the recipient's interests and values. Address the recipient (${obj.fullName}) by their first name and craft the message to resonate with supporters of the ${obj.party} political party who are of ${obj.age}. Include a shortened hyperlink (${donateLink}) for easy donation. Avoid directly mentioning personal details like political party and age, but leverage the provided parameters creatively to make the content more relevant and engaging. Sign the text from ${orgName} or a variation. Your response should be formatted HTML.`,
    //         "max_tokens": 240,
    //         "temperature": 0.5
    //         }
    //     } else if (deliveryMethod === 'email') {
    //         data={
    //             "model": "text-davinci-003",
    //             //"prompt": `Create a fundraising text message addressed to ${obj.fullName} for a ${campaignDesc} campaign named "${orgName}" based on ${narrative} that targets US citizens of age ${obj.age} that are members of the ${obj.party} political party - be sure to include a shortened hyperlink to donate at ${donateLink} and address the recipient by first name, but do not explicitly mention age or political party, just use those parameters to tailor your content.`,
    //             "prompt": `Pretend you are working for a ${campaignDesc} campaign named "${orgName}". Compose a compelling fundraising email body for a ${campaignDesc} campaign named "${orgName}" targeting US citizens, with the goal of encouraging donations. Tailor the content based on ${narrative} and consider the recipient's interests and values. Address the recipient (${obj.fullName}) by their first name and craft the message to resonate with supporters of the ${obj.party} political party who are of ${obj.age}. Avoid directly mentioning personal details like political party and age, but leverage the provided parameters creatively to make the content more relevant and engaging. Your response should be formatted HTML.`,
    //             "max_tokens": 500,
    //             "temperature": 0.5
    //         }
    //     }

    //     return axios
    //     .post(apiUrl, data, { headers })
    //     .then((response) => {
    //     // Handle the response
    //     console.log(response.data.choices[0]);
    //     return response.data.choices[0].text;
    //     })
    //     .catch((error) => {
    //     // Handle errors
    //     return error;
    //     });
    // });

    // Promise.all(promises)
    // .then((msgArray) => {
    //     // Iterate through the array of GPT-tailored messages
    //     msgArray.map((msg, index) => {
    //     const name = combinedData[index].fullName;
    //     if(deliveryMethod === 'email')
    //         {
    //         const email = combinedData[index].emailAddress;
    //         if(email === undefined) {
    //             console.log('no email! delivery aborted')
    //         } else {
    //             const request = mailjet
    //             .post('send', { version: 'v3.1' })
    //             .request({
    //                 Messages: [
    //                 {
    //                     From: {
    //                     Email: "info@smartraiser.ai",
    //                     Name: "SmartRaiser"
    //                     },
    //                     To: [
    //                     {
    //                         Email: email,
    //                         Name: name
    //                     }
    //                     ],
    //                     TemplateID: 4847744,
    //                     TemplateLanguage: true,
    //                     Subject: `${orgName} Needs Your Help!`,
    //                     Variables: {
    //                         msg: msg,
    //                         orgName: orgName,
    //                         donateLink: donateLink
    //                     },
    //                     TemplateErrorReporting: {
    //                         Email: "phil@smartraiser.ai",
    //                         Name: "Phil LeClair"
    //                     }
    //                 }
    //                 ]
    //             })

    //         request
    //         .then((result) => {
    //             console.log(result.body)
    //         })
    //         .catch((err) => {
    //             console.log(err.statusCode)
    //         })
    //         }
    //     } else if (deliveryMethod === 'text') {
    //         const num = combinedData[index].phoneNumber.replace(/-/g,'');
    //         if(num === undefined) {
    //         console.log('no number! delivery aborted')
    //         } else {
    //         client.messages
    //         .create({ body: msg, from: "+18885459281", to: `+1${num}` })
    //         .then(message => console.log(message.sid));
    //         }
    //     }
    //     });

    //     res.json({ data: combinedData, message: "File upload successful", gpt: msgArray});
    // })
    // .catch((error) => {
    //     // Handle errors in promise.all
    //     console.error(error);
    // });
});

module.exports = uploadRouter;