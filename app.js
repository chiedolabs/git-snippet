// NEW
'use strict';
let fs = require('fs');

let env  = process.env.NODE_ENV;
// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually lift from.
// Load dotenv if available
fs.stat('.env', (err, stat) => {
  if(err === null) {
    require('dotenv').config({silent: true});
  }
});

process.chdir(__dirname);

//Allow the use of more es6 features within the node project, such as es6 imports, etc.
require('babel/register');

let express       = require('express');
let cookieParser  = require('cookie-parser');
let app           = express();
let bodyParser    = require('body-parser');
let morgan        = require('morgan');
let cors          = require('cors');
let path          = require('path');
let router        = express.Router();
let generateSnippet = require('./app/controllers/generate-snippet');

//Enable all cors requests
app.use(cors());

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if(env === 'development') {
  // Log requests to the console
  app.use(morgan('dev'));
}

app.use(router);

// Routes
router.route('*')
  .get(generateSnippet.index);

let port = process.env.PORT || 8000;

let server = app.listen(port, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = server;
