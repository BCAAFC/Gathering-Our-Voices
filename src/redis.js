"use strict";

module.exports = function (env) {
    var uri    = require('url').parse(env.REDIS_URL),
        client = require('redis').createClient(uri.port || 6379, uri.hostname);

    if (uri.auth) {
        client.auth(uri.auth.split(':')[1]);
    }
};
