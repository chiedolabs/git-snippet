'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');

let fs      = require('fs-extra-promise');
let slugify = require("slugify-url");
let path    = require("path");
let ua      = require('universal-analytics');

module.exports.index = (req, res) => {
  let visitor;

  if(process.env.GOOGLE_ANALYTICS_ID && process.env.GOOGLE_ANALYTICS_UUID) {
    visitor = ua(process.env.GOOGLE_ANALYTICS_ID, process.env.GOOGLE_ANALYTICS_UUID);
  }

  let source = req.query['source'];

  let sourceURL;
  let sourceDisplay;
  let prettyURL;
  let githubURL = `https://raw.githubusercontent.com${req.originalUrl}`;
  
  if(source === 'gitlab') {
    // Create the URL and display text for viewing the code on GitLab
    prettyURL = `https://gitlab.com${req.originalUrl}`;
    sourceDisplay = 'GitLab';

    // Get the URL for fetching the data
    let split = req.originalUrl.split('/');
    split[3] = 'raw';
    let path = split.join('/');
    sourceURL = `https://gitlab.com${path}`;
  } else if(source === 'bitbucket') {
    // Create the URL and display text for viewing the code on BitBucket
    let prettySplit = req.originalUrl.split('/');
    prettySplit[3] = 'src';
    let prettyPath = prettySplit.join('/');
    prettyURL = `https://bitbucket.org${prettyPath}`;
    sourceDisplay='BitBucket';

    // Get the URL for fetching the data
    let split = req.originalUrl.split('/');
    split[3] = 'raw';
    let path = split.join('/');
    sourceURL = `https://bitbucket.org${path}`;
  } else {
    // If none of the above, default to GitHub
    // Create the URL and display text for viewing the code on GitHub
    let prettySplit = req.originalUrl.split('/');
    prettySplit.splice(3, 0, 'tree');
    let prettyPath = prettySplit.join('/');
    prettyURL = `https://github.com${prettyPath}`;
    sourceDisplay='GitHub';

    // Get the URL for fetching the data
    sourceURL = githubURL;
  }

  if(process.env.GOOGLE_ANALYTICS_ID && process.env.GOOGLE_ANALYTICS_UUID) {
    visitor.pageview(req.originalUrl).send();
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

  let cacheFileName = slugify(sourceURL);
  let cacheDir = path.dirname(require.main.filename)+'/cache';
  let cachedFilePath = cacheDir+'/'+cacheFileName +'.txt';

  // Make the cache directory if it doesn't exist
  if (!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
  }
  // First check if cached file exists
  return fs.stat(cachedFilePath, function(err) {
    return Promise.resolve(true)
    .then(() => {
      if(!err) {
        return fs.readFileAsync(cachedFilePath, 'utf8');
      } else {
        // Get the data from github
        return fetch(sourceURL)
        .then((response) => {
          if (response.status >= 400) {
            throw new Error("Bad response from server");
          }
          return response.text();
        })
        .then((code) => {
          if(code.length > 1000000){
            throw new Error("Your code sample was too large. There is a 1MB limit.");
          }

          // Add the file to the cache
          return fs.writeFileAsync(cachedFilePath, code)
          .then(() =>{
            return code;
          });
        })
        .catch((error) => {
          console.dir(error);
          return res.send('console.dir("You made a mistake somewhere. Your code could not be fetched.")');
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


      // Add the script which loads Google code prettify
      let skin = req.query['skin'] || 'sons-of-obsidian';
      // Get lang from file extension
      let lang = req.query['lang'] || req.originalUrl.split('?')[0].split('.').reverse()[0];

      // Add the openening and closing pre tags
      let wrappedCode =''
      let genCSS = 'position: relative; top: 5px; padding: 5px; border-top: 1px #333333 solid; opacity: .7; font-family: sans-serif; font-size: 12px; font-weight: 900; margin-left: -10px; margin-bottom: -10px;';

      wrappedCode += `document.write('<div style="position: relative;"><pre class=\\"prettyprint lang-${lang}\\" style="padding:10px; padding-bottom: 20px;">');\n`;
      wrappedCode += `${sampleCode}\n`;
      wrappedCode += `document.write('<div style="${genCSS}" class="git-snippet-attribution">Generated by <a href="https://www.gitsnippet.com" target="_blank">Git Snippet</a>&nbsp;-&nbsp; View on <a href="${prettyURL}" target="_blank">${sourceDisplay}</a></div>');`;
      wrappedCode += `document.write('</pre></div>');`;
      sampleCode = wrappedCode;

      let prettifyLoader ='';
      prettifyLoader += `function loadJS(file) {\n`
      prettifyLoader += `window.runPrettifyLoaded = true;\n`
      prettifyLoader += `var jsElm = document.createElement("script");\n`
      prettifyLoader += `jsElm.type = "application/javascript";\n`
      prettifyLoader += `jsElm.src = file;\n`
      prettifyLoader += `document.body.appendChild(jsElm);\n`
      prettifyLoader += `}\n`
      prettifyLoader += `if(window.runPrettifyLoaded !== true) {\n`
      prettifyLoader += `loadJS('https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?skin=${skin}');\n`
      prettifyLoader +=` }\n`

      sampleCode = `${sampleCode}${prettifyLoader}`;
      
      // Return the script
      res.set('Content-Type', 'application/x-javascript'); 
      return res.send(sampleCode);
    })
  });
};
