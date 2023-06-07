const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const middleware = require('./utils/middleware');
require('dotenv').config();

//import routers
const configRouter = require('./controllers/configurations');
const usersRouter = require('./controllers/users');
const listRouter = require('./controllers/lists');
const uploadRouter = require('./controllers/upload');
const loginRouter = require('./controllers/login');
const gptRouter = require('./controllers/gpt');
const templateRouter = require('./controllers/templates');
const statsRouter = require('./controllers/statistics')

//config server
const app = express();
const port = 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('build'));
app.use(cors());
app.use(fileUpload());
app.use(middleware.tokenExtractor);
app.use('/api/configurations',configRouter);
app.use('/api/users',usersRouter);
app.use('/api/lists',listRouter);
app.use('/api/upload',uploadRouter);
app.use('/api/login',loginRouter);
app.use('/api/gpt',gptRouter)
app.use('/api/templates',templateRouter)
app.use('/api/statistics',statsRouter)
app.use(middleware.errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
