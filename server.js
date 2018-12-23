const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler')
const apiRouter = require('./api/api');

//set port to listen on 4000
const PORT = process.env.PORT || 4000;

//using middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static('public'));

//using apiRouter from api.js file
app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


module.exports = app;
