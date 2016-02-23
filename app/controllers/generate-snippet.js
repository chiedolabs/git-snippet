'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports.index = (req, res) => {
  let githubURL;
  if(process.env === 'production') {
    githubURL = `https://raw.githubusercontent.com${req.originalUrl}`;
  } else {
    let port = process.env.PORT || 8000;
    githubURL = `http://localhost:${port}/test-code`;
  }

  let start = parseInt(req.query['start'], 10) - 1;
  let end = parseInt(req.query['end'], 10) - 1;
   
  return fetch(githubURL)
  .then((response) => {
    if (response.status >= 400) {
      throw new Error("Bad response from server");
    }
    return response.text();
  })
  .then((code) => {
    let lines = code.split('\n');

    let sampleLines = [];

    if(start !== NaN && end !== NaN) {
      for(let i = start; i <= end; i++) {
        sampleLines.push(lines[i]);
      }
    } else {
      sampleLines = lines;
    }

    let sampleCode = sampleLines.join('\n');
    
    return res.send(sampleCode);
  })
  .catch((error) => {
    return res.json({
      error: error.message,
    });
  });
};
