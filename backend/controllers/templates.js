// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const templateRouter = require('express').Router();
const {userExtractor} = require('../utils/middleware');

//import models
const Template = require('../models/template');
const User = require('../models/user');

// MongoDB configuration
// const MONGO_URI = process.env.MONGO;

// Connect to MongoDB
// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error);
//   });

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

templateRouter.put('/', userExtractor, async (req, res) => {
  try {
      let name = req.body.name;
      let newTemplate = req.body.newTemplate;
      const id = req.body.id;
      
      //check to see if user's token matches the config creator's
      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (!decodedToken.id) {
          res.status(401).json({ error: 'token invalid' })
      }
      const user = req.user;
      const template = await Template.findById(id)
      if (template === null) {
          res.status(401).json({error: 'No template found with that ID'})
      } else if (!(user._id.toString() === template.user.toString())) {
          res.status(401).json({error: 'Templates can only be updated by the creator'})
      } else {
          // Update the template
          if (name === '')
              name = Template.findById(id).name;
          if (newTemplate === undefined || (Object.keys(newTemplate).length === 0))
              template = Template.findById(id).template;
          Template.findByIdAndUpdate(id,{name: name, template: newTemplate})
          .then(config => {
              res.json({ message: 'Template updated successfully', template: template });
          })
          .catch(error => {
              res.status(500).json({error: 'Failed to update template'})
          })
      }
  } catch (error) {
      console.log('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
  }
});
  
templateRouter.delete('/:id', userExtractor, async (req, res) => {
  try {
      const id = req.params.id;

      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (!decodedToken.id) {
          res.status(401).json({ error: 'token invalid' })
      }
      const user = req.user;
      const template = await Template.findById(id)
      if (template === null) {
          res.status(401).json({error: 'No template found with that ID'})
      } else if (!(user._id.toString() === template.user.toString())) {
          res.status(401).json({error: 'Templates can only be deleted by their creator'})
      } else {
          Template.findByIdAndDelete(id)
          .then(template => {
              res.json({ message: 'Template deleted successfully', template: template });
          })
          .catch(error => {
              res.status(500).json({error: 'Failed to delete template'})
      })}
  } catch (error) {
      console.log('Error deleting template', error);
      res.status(500).json({ error: 'Failed to delete template' });
  }
})

templateRouter.get('/', userExtractor, async (req, res, next) => {
  try {
    if (req.user) {
      const templates = await Template.find().populate('user', {username: 1, name: 1})
      const userTemplates = templates.filter((template)=>{
          if (template.user._id.toString() === req.user._id.toString())
              return template
      })
      res.json(userTemplates)
    } else {
      const templates = await Template.find().populate('user', {username: 1, name: 1})
      res.json(templates);
    }
  } catch (err) {
    next(err)
  }
});

module.exports = templateRouter;