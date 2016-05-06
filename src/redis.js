"use strict";

module.exports = function () {
    var uri    = require('url').parse(process.env.REDIS_URL),
        client = require('redis').createClient(uri.port || 6379, uri.hostname);
    if (uri.auth) {
        client.auth(uri.auth.split(':')[1]);
    }
};
