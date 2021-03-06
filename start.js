#! /bin/env node

/**
* Gathering Our Voices
* @author Andrew Hobden <andrew@hoverbear.org>
*/
'use strict';

// Check the environment.
var config = require("./config/config");

// Connect to the database.
var db = require("./models");

// Fire up the HTTP server.
var httpd = require("./src/httpd")(db);

// Assign the routers to the server.
httpd = require("./src/routers")(httpd, db);

httpd.listen(config.port, function () {
  console.log("Listening on " + config.port);
});

// Start up one time cron jobs.
var cronjobs = require("./src/cronjobs")(db);


module.exports = httpd;
