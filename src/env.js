"use strict";

var async = require("async"),
    promise = require("bluebird"),
    _     = require("lodash");

// Getters for various `env` variables.
var getters = {
    get NODE_ENV () {
        return process.env.NODE_ENV;
    },
    get SSL () {
        return process.env.SSL;
    },
    get PORT () {
        return process.env.PORT;
    },
    get SECRET () {
        return process.env.SECRET;
    },
    get ADMINS () {
        return process.env.ADMINS;
    },
    get MAX_YOUTH () {
        return process.env.MAX_YOUTH;
    },
    get DATABASE_URL () {
        return process.env.POSTGRES_URL;
    },
    get REDIS_URL () {
        return process.env.REDIS_URL;
    },
    get MANDRILL_APIKEY () {
        return process.env.MANDRILL_APIKEY;
    },
};

/**
 * Checks an `environment` value, if it does not exist falls back to `fallback`
 */
function check(variable, fallback) {
    if (process.env[variable] === undefined) {
        process.env[variable] = fallback;
        console.warn("$" + variable + " not set. Defaulted to: " + process.env[variable]);
    } else {
        console.log("$" + variable + " set to " + process.env[variable]);
    }
}

/**
 * Returns a nice set of convienence functions.
 */
module.exports = function () {
    check("NODE_ENV", "development");
    check("SSL", true);
    check("PORT", 8080);
    check("SECRET", "I'm insecure!");
    check("ADMINS", ["andrew@hoverbear.org"]);
    check("MAX_YOUTH", 2000);
    check("POSTGRES_URL", process.env.HEROKU_POSTGRESQL_NAVY_URL || "postgres://localhost/test");
    check("REDIS_URL", process.env.REDISCLOUD_URL || "localhost");
    check("MANDRILL_APIKEY", undefined);
    return getters;
};

