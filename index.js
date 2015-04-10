/**
 * Gathering Our Voices
 * @author Andrew Hobden <andrew@hoverbear.org>
 */
"use strict";

// Check the environment.
var env = require("./src/env")();

// Connect to the database.
var db = require("./src/db")(env);

// Connect to redis.
var redis = require("./src/redis")(env);

// Fire up the HTTP server.
var httpd = require("./src/httpd")(env, db, redis);

// Assign the routers to the server.
require("./src/routers")(httpd);

httpd.listen(env.PORT, function () {
    console.log("Listening on " + env.PORT);
});
