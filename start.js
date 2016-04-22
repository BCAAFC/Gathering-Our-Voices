#! /bin/env node

/**
 * Gathering Our Voices
 * @author Andrew Hobden <andrew@hoverbear.org>
 */
"use strict";

// Check the environment.
var env = require("./src/env")();

// Connect to the database.
var db = require("./src/db")();

// Connect to redis.
var redis = require("./src/redis")();

// Fire up the HTTP server.
var httpd = require("./src/httpd")(db, redis);

// Assign the routers to the server.
httpd = require("./src/routers")(httpd, db, redis);

httpd.listen(process.env.PORT, function () {
    console.log("Listening on " + process.env.PORT);
});

// Start up one time cron jobs.
var cronjobs = require("./src/cronjobs")(db);


module.exports = httpd;
