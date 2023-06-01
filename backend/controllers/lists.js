const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const listRouter = require('express').Router();
const {userExtractor} = require('../utils/middleware');

//import models
const List = require('../models/list');
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
listRouter.post('/', userExtractor, async (req, res) => {
    try {
      const name = req.body.name;
      const list = req.body.jsonData;
      const id = req.body.id;

      const decodedToken = jwt.verify(req.token, process.env.SECRET)
      if (!decodedToken.id) {
        return res.status(401).json({ error: 'token invalid' })
      }
      const user = req.user;

      // Check if the configuration name already exists in the database
      const existingList = await List.findOne({ name });
      if (existingList) {
        return res.status(400).json({ error: 'List name already exists' });
      }
  
      // Save the new configuration
      const newList = new List({ name, list, user: user._id });
      await newList.save();

      user.lists = user.lists.concat(newList._id)
      await user.save();
  
      res.json({ message: 'List saved successfully', list: newList });
    } catch (error) {
      console.log('Error saving list:', error);
      res.status(500).json({ error: 'Failed to save list' });
    }
  });
  
listRouter.put('/', userExtractor, async (req, res) => {
    try {
        let name = req.body.name;
        let data = req.body.data;
        const id = req.body.id;
        
        //check to see if user's token matches the config creator's
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!decodedToken.id) {
            res.status(401).json({ error: 'token invalid' })
        }
        const user = req.user;
        const list = await List.findById(id)
        if (list === null) {
            res.status(401).json({error: 'No list found with that ID'})
        } else if (!(user._id.toString() === list.user.toString())) {
            res.status(401).json({error: 'Lists can only be updated by the creator'})
        } else {
            // Update the configuration
            if (name === '')
                name = List.findById(id).name;
            if (columnMappings === undefined || (Object.keys(columnMappings).length === 0))
                columnMappings = Configuration.findById(id).columnMappings;
            Configuration.findByIdAndUpdate(id,{name: name, columnMappings: columnMappings})
            .then(config => {
                res.json({ message: 'Configuration updated successfully', config: config });
            })
            .catch(error => {
                res.status(500).json({error: 'Failed to update configuration'})
            })
        }
    } catch (error) {
        console.log('Error updating configuration:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
  });
  
listRouter.delete('/:id', userExtractor, async (req, res) => {
    try {
        const id = req.params.id;

        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!decodedToken.id) {
            res.status(401).json({ error: 'token invalid' })
        }
        const user = req.user;
        const config = await Configuration.findById(id)
        if (config === null) {
            res.status(401).json({error: 'No configuration found with that ID'})
        } else if (!(user._id.toString() === config.user.toString())) {
            res.status(401).json({error: 'Configurations can only be deleted by their creator'})
        } else {
            Configuration.findByIdAndDelete(id)
            .then(config => {
                res.json({ message: 'Configuration deleted successfully', config: config });
            })
            .catch(error => {
                res.status(500).json({error: 'Failed to delete configuration'})
        })}
    } catch (error) {
        console.log('Error deleting configuration', error);
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
  })
  
  
  // Fetch configurations endpoint
listRouter.get('/', userExtractor, (req, res) => {
    List.find().populate('user', {username: 1, name: 1})
      .then((lists) => {
        if (req.user) {
            const userLists = lists.map((list)=>{
                if (list.user._id.toString() === req.user._id.toString())
                    return list
            })
            if (userLists[0] === undefined)
                res.status(500).json({ error: 'Failed to fetch lists' });
            else
                res.json(userLists)
        } else {
            res.json(lists);
        }
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to fetch lists' });
      });
  });

module.exports = listRouter;