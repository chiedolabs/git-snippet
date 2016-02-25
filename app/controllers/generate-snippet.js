'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');
let client = require('../redis');

module.exports.index = (req, res) => {
  let githubURL;

  if(process.env === 'production') {
    // Get the URL
    githubURL = `https://raw.githubusercontent.com${req.originalUrl}`;
  } else {
    // Use a sample URL locally
    let port = process.env.PORT || 8000;
    githubURL = `http://localhost:${port}/test-code`;
  }

  // Store the start line and end line
  let start;
  let end;
  if(req.query['start']) {
    start = parseInt(req.query['start'], 10) - 1;
  }
  if(req.query['end']) {
    end = parseInt(req.query['end'], 10) - 1;
  }
  
  let getCachedData;

  if(client.connected) {
    getCachedData =  client.getAsync(githubURL);
  } else {
    getCachedData = Promise.resolve(false);
  }

  return getCachedData
  .then((res) => {
    // Return the cached data if located otherwise, return nothing
    if(res) {
      return res;
    } else {
      return fetch(githubURL)
      .then((response) => {
        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }
        return response.text();
      })
      .then((code) => {
        // Cache if redis is setup
        if(client.connected) {
          client.set(githubURL, code); 
        }

        return code;
      })
      .catch((error) => {
        return res.json({
          error: error.message,
        });
      });
    }
  })
  .then((code) => {
    let lines = code.split('\n');
    
    let sampleLines = [];
    
    // If a start and end line were specified, store all the matching lines,
    // else, store all the lines

    if(!start) {
      start = 0;
    }
    
    if(!end) {
      end = lines.length - 1;
    }

    for(let i = start; i <= end; i++) {
      if(lines[i] !== undefined) {
        // Clean the quotes
        let parsedLine = lines[i].replace(/\"/ig, '\\"').replace(/\'/ig,"\\'");

        // We use document.writes to make sure it gets output to the page when the script is accessed
        sampleLines.push(`document.write('${parsedLine}\\r\\n');`);
      }
    }
    
    // Recombine the string
    let sampleCode = sampleLines.join('\n');
    
    // Add the openening and closing pre tags
    let wrappedCode =''
    let genCSS = 'position: absolute; bottom: 10px; padding: 5px; border-top: 1px #333333 solid; opacity: .7; font-family: sans-serif; font-size: 12px; font-weight: 900; margin-left: -10px; margin-bottom: -10px;';

    wrappedCode += `document.write('<div style="position: relative;"><pre class=\\"prettyprint\\" style="padding:10px; padding-bottom: 30px;">');\n`;
    wrappedCode += `${sampleCode}\n`;
    wrappedCode += `document.write('<div style="${genCSS}">Generated by <a href="http://chiedolabs.github.io/git-snippet" target="_blank">Git Snippet</a></div>');`;
    wrappedCode += `document.write('</pre></div>');`;
    sampleCode = wrappedCode;

    // Add the script which loads Google code prettify
    let skin = req.query['skin'] || 'sons-of-obsidian';
    // Get lang from file extension
    let lang = req.query['lang'] || req.originalUrl.split('?')[0].split('.').reverse()[0];

    let prettifyLoader ='';
    prettifyLoader += `if(window.runPrettifyLoaded !== true) {\n`
    prettifyLoader += `loadJS('https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?lang=${lang}&skin=${skin}');\n`
    prettifyLoader += `function loadJS(file) {\n`
    prettifyLoader += `window.runPrettifyLoaded = true;\n`
    prettifyLoader += `var jsElm = document.createElement("script");\n`
    prettifyLoader += `jsElm.type = "application/javascript";\n`
    prettifyLoader += `jsElm.src = file;\n`
    prettifyLoader += `document.body.appendChild(jsElm);\n`
    prettifyLoader += `}\n`
    prettifyLoader +=` }\n`

    sampleCode = `${sampleCode}${prettifyLoader}`;
    
    // Return the script
    res.set('Content-Type', 'application/x-javascript'); 
    return res.send(sampleCode);
  })
  .catch((error) => {
    return res.json({
      error: error.message,
    });
  });
};
