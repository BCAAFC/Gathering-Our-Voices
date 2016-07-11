'use strict';

var config = require("../config/config");

var fs = require("fs"),
marked = require("marked"),
express = require("express"),
morgan = require("morgan");

module.exports = function (db, redisClient) {
  var server = express();

  // Logging
  server.use(morgan("common"));

  // Favicon
  server.use(require("serve-favicon")("./static/favicon.ico"));
  // Parsers for JSON/URL encoding.
  server.use(require("body-parser").json());
  server.use(require("body-parser").urlencoded({ extended: true }));
  // Multipart form handling, for image uploads.
  server.use(require("multer")({
    dest: "./uploads/temp/",
    putSingleFilesInArray: true, // Will be default next version.
    limits: {
      fileSize: 200*1000*1000, // 200mb
    },
  }).single("data"));
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
    secret            : config.secret,
    store             : new RedisStore({
      client: redisClient,
      ttl: 60*60*8 // 8 hours
    }),
    resave            : true,
    saveUninitialized : true,
    secure            : true
  }));

  // View engine
  var hbs = require("hbs");
  hbs.registerPartials('./views/partials');
  hbs.localsAsTemplateData(server);
  server.locals.config = require('../config/config');
  // Load helpers.
  require("./handlebars")(hbs);

  server.set("view engine", "hbs");
  server.set("views", "./views");

  // Static Mappings
  server.use("/css", express.static("./static/css",
    { maxAge: 86400000 * 4 }));
  server.use("/documents", express.static("./static/documents",
    { maxAge: 86400000 * 4 }));
  server.use("/fonts", express.static("./static/fonts",
    { maxAge: 86400000 * 4 }));
  server.use("/images", express.static("./static/images",
    { maxAge: 86400000 * 4 }));
  server.use("/logos", express.static("./static/logos",
    { maxAge: 86400000 * 4 }));
  server.use("/js", express.static("./static/js",
    { maxAge: 86400000 * 4 }));
  server.get("/favicon.ico", function (req, res) { res.send("./static/favicon.ico"); });

  return server;
};
