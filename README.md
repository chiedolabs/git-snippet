# Git Snippet
The goal of this is to allow you to embed code samples into your webpages straight from your github account the same way you can from github gists. You can use your own server and deploy this code or you can use the Gitsnippet.com server.

## Getting Started

1. Run `npm install`
1. Run `npm start`
1. Get a raw content URL from git. Include the commit because your URL will be cached to prevent overloading Github's servers.
1. visit localhost:8000/test.html to see an example of this in action.

## Usage:
Once deployed to your server, you can add script embeds to your page as shown in this example:

```
<html>
  <body>
    <h2>output one</h2>
    <script src="http://localhost:8000/chiedolabs/blog-app-in-many-stacks/a8f50d39f4c42a928c49dee6100ba36ce219aeee/reactjs-redux-rest/front-ends/reactjs-redux-rest/src/reducers/application-reducer.js"></script>

    <h2>output two with all options</h2>
    <script src="http://localhost:8000/chiedolabs/blog-app-in-many-stacks/a8f50d39f4c42a928c49dee6100ba36ce219aeee/reactjs-redux-rest/front-ends/reactjs-redux-rest/src/app.js?start=1&end=10&skin=sunburst&lang=js"></script>
  </body>
</html>

```

## Query String Options
You can add the following query strings to the script tag to alter the behavior of the script.

- start - The first line you would like to include in the code output. Must be used with 'end'
- end - The last line you would like to inclued in the code output. Must be used with 'start'
- lang - The Google Prettify language formatter to use for formatting your output. If not used, your file extension will be used. See the <a href="https://github.com/google/code-prettify" target="_blank">supported languages</a>.
- skin - The Google Prettify skin to be used. See the <a href="https://rawgit.com/google/code-prettify/master/styles/index.html" target="_blank">skin gallery</a>


## Development

Unless your local environment is set to 'production', your request will always be redirected to localhost:8000/test-code. This is to prevent github from getting annoyed.

If you have a local redis server running, caching will be done through redis, otherwise, no caching will be performed.

## Deployment
Deployment is pretty simple. Deploy with whatever you want. Just set an Environment variable named ```PORT``` and set it to ```80```.

## Contributing

If anyone cares enough to contribute, I'll populate this... lol

## DISCLAIMER
We are in no way affiliated with Github.com. USE AT YOUR OWN RISK.

## LICENSE
MIT
