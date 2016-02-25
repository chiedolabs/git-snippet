# Git Snippet
The goal of this is to allow you to embed code samples into your webpages straight from your github account the same way you can from github gists. You can use your own server and deploy this code or you can use the Gitsnippet.com server.

<a href="http://www.gitsnippet.com" target="_blank">Read the docs for usage information.</a>

## Getting Started

1. Run `npm install`
1. Run `npm start`
1. Get a raw content URL from git. Include the commit because your URL will be cached to prevent overloading Github's servers.
1. visit localhost:8000/test.html to see an example of this in action.

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
