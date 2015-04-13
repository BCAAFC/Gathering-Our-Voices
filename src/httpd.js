"use strict";

var fs = require("fs"),
    express = require("express"),
    morgan = require("morgan");

module.exports = function (env, db, redisClient) {
    var server = express();
    
    // Ensure that requests that should be SSL use SSL.
    server.use(function ensureSecurity(req, res, next) {
        // This detects if the original request (prior to Heroku"s forwarding) was SSL based.
        // If the requests aren"t from localhost (eg. For development) it redirects them to the HTTPS site.
        if (process.env.SSL && req.headers["x-forwarded-proto"] !== "https" && req.hostname !== "localhost") {
            res.redirect("https://" + req.hostname + req.url);
        } else {
            next();
        }
    });
    
    // Logging
    server.use(morgan("common"));
    
    // Favicon
    server.use(require("serve-favicon")("./static/favicon.ico"));
    // Parsers for JSON/URL encoding.
    server.use(require("body-parser").json());
    server.use(require("body-parser").urlencoded({extended: true}));
    // Multipart form handling, for image uploads.
    server.use(require("multer")());
    // Allow PUT/DELETE in forms.
    server.use(require("method-override")(function methodOverrider(req, res) {
        // Just include a `_method` input on a form with the method you want.
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));
    
    // Session handling.
    var session = require("express-session"),
        RedisStore = require("connect-redis")(session);
    server.use(require("express-session")({
        secret            : process.env.SECRET,
        store             : new RedisStore({
            client: redisClient,
            ttl: 60*60*8 // 8 hours
        }),
        resave            : true,
        saveUninitialized : true,
        secure            : true
    }));
    
    // View engine
    server.set("views", "./views");

    return server;
};