const User = require('../models/user');
const jwt = require('jsonwebtoken');

//Fetch token helper
const tokenExtractor = (req,res,next) => {
  let authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    authorization = authorization.replace('Bearer ', '')
  }
  req.token = authorization;
  next()
}

//Fetch user helper
const userExtractor = async (req,res,next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    req.user = await User.findById(decodedToken.id)
    next()
  } catch (error) {
    next(error)
  }
}

function errorHandler (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  } else if (err.message === 'jwt expired') {
    res.status(401).json({error: 'Token expired, please login again'})
    next()
  } else {
    console.log(err)
    res.status(500).json({error: err})
    next()
  }
}

module.exports = {tokenExtractor,userExtractor,errorHandler};