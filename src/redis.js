'use strict';

var config = require('../config/config');

module.exports = function () {
  var uri    = require('url').parse(config.redis),
  client = require('redis').createClient(uri.port || 6379, uri.hostname);
  if (uri.auth) {
    client.auth(uri.auth.split(':')[1]);
  }
};
