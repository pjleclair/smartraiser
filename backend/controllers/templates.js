const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const templateRouter = require('express').Router();
const {userExtractor} = require('../utils/middleware');

//import models
const Template = require('../models/template');
const User = require('../models/user');

// MongoDB configuration
const MONGO_URI = 'mongodb+srv://fullstack:fs0pen@cluster0.00quc3x.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Save configuration endpoint
templateRouter.post('/', userExtractor, async (req, res) => {
    try {
      const name = req.body.templateName;
      const template = req.body.templateObj.selectedTemplate;

      const campaignDesc = req.body.templateObj.campaignDesc;
      const orgName = req.body.templateObj.orgName;
      const narrative = req.body.templateObj.narrative;
      const donateLink = req.body.templateObj.donateLink;
      const intendedDeliveryMethod = req.body.templateObj.intendedDeliveryMethod;

      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (!decodedToken.id) {
        return res.status(401).json({ error: 'token invalid' })
      }
      const user = req.user;

      // Check if the configuration name already exists in the database
      const existingTemplate = await Template.findOne({ name });
      if (existingTemplate) {
        return res.status(400).json({ error: 'Template name already exists' });
      }
  
      // Save the new configuration
      const newTemplate = new Template({ name, template, user: user._id, campaignDesc, orgName, narrative, donateLink, intendedDeliveryMethod });
      await newTemplate.save();

      user.templates = user.templates.concat(newTemplate._id)
      await user.save();
  
      res.json({ message: 'Template saved successfully', template: newTemplate });
    } catch (error) {
      console.log('Error saving template:', error);
      res.status(500).json({ error: 'Failed to save template' });
    }
  });

  templateRouter.get('/', userExtractor, (req, res) => {
    Template.find().populate('user', {username: 1, name: 1})
      .then((templates) => {
        if (req.user) {
            const userTemplates = templates.map((template)=>{
                if (template.user._id.toString() === req.user._id.toString())
                    return template
            })
            if (userTemplates[0] === undefined)
                res.status(500).json({ error: 'Failed to fetch templates' });
            else
                res.json(userTemplates)
        } else {
            res.json(templates);
        }
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch templates' });
      });
  });

module.exports = templateRouter;