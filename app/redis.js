'use strict';

let redis  = require('redis');
let bluebird = require('bluebird');
let client;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

client = redis.createClient();
// If a redis server is not detected just set it to undefined
client.on("error", function (err) {
});


module.exports = client;
