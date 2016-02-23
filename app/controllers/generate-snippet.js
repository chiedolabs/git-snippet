'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');

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
    
    // If a start and end line were specified, store all the matching lines,
    // else, store all the lines
    if(start !== NaN && end !== NaN) {
      for(let i = start; i <= end; i++) {
        if(lines[i]) {
          // Clean the quotes
          let parsedLine = lines[i].replace(/\"/ig, '\\"').replace(/\'/ig,"\\'");

          // We use document.writes to make sure it gets output to the page when the script is accessed
          sampleLines.push(`document.write('${parsedLine}\\r\\n');`);
        }
      }
    } else {
      sampleLines = lines;
    }
    
    // Recombine the string
    let sampleCode = sampleLines.join('\n');
    
    // Add the openening and closing pre tags
    sampleCode = `document.write('<pre class=\\"prettyprint\\" style="padding:10px;">');\n${sampleCode}\ndocument.write('</pre>');`;

    // Add the script which loads Google code prettify
    let skin = req.query['skin'] || 'sons-of-obsidian';
    // Get lang from file extension
    let lang = req.originalUrl.split('?')[0].split('.').reverse()[0];

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
