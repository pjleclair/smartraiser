// const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const listRouter = require('express').Router();
const {userExtractor} = require('../utils/middleware');

//import models
const List = require('../models/list');
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

    // Check if the list name already exists in the database
    const existingList = await List.findOne({ name });
    if (existingList) {
      return res.status(400).json({ error: 'List name already exists' });
    }

    // Save the new list
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
      let newList = req.body.selectedList.list;
      const id = req.body.selectedList._id;
      
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
          // Update the list
          if (name === '')
              name = List.findById(id).name;
          if (newList === undefined || (Object.keys(newList).length === 0))
              list = List.findById(id).list;
          List.findByIdAndUpdate(id,{name: name, list: list.list})
          .then(config => {
              res.json({ message: 'List updated successfully', list: list });
          })
          .catch(error => {
              res.status(500).json({error: 'Failed to update configuration'})
          })
      }
  } catch (error) {
      console.log('Error updating list:', error);
      res.status(500).json({ error: 'Failed to update list' });
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
      const list = await List.findById(id)
      if (list === null) {
          res.status(401).json({error: 'No list found with that ID'})
      } else if (!(user._id.toString() === list.user.toString())) {
          res.status(401).json({error: 'Lists can only be deleted by their creator'})
      } else {
          List.findByIdAndDelete(id)
          .then(list => {
              res.json({ message: 'List deleted successfully', list: list });
          })
          .catch(error => {
              res.status(500).json({error: 'Failed to delete list'})
      })}
  } catch (error) {
      console.log('Error deleting list', error);
      res.status(500).json({ error: 'Failed to delete list' });
  }
})
  
  
  // Fetch configurations endpoint
listRouter.get('/', userExtractor, async (req, res, next) => {
  try {
    if (req.user) {
      const lists = await List.find().populate('user', {username: 1, name: 1})
      const userLists = lists.filter((list)=>{
          if (list.user._id.toString() === req.user._id.toString())
              return list
      })
      res.json(userLists)
    } else {
      const lists = await List.find().populate('user', {username: 1, name: 1})
      res.json(lists)
    }
  } catch (err) {
    next(err)
  }
});

module.exports = listRouter;