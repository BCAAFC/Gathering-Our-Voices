'use strict';

var hbs = require("hbs"),
    url = require("url");

module.exports = function (db, redis) {
  var router = require("express").Router();

  router.get("/about", function (req, res) {
    res.render("about", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/conduct", function (req, res) {
    res.render("condut", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/faq", function (req, res) {
    res.render("faq", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/login", function (req, res) {
    res.render("login", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/news", function (req, res) {
    res.render("news", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/privacy", function (req, res) {
    res.render("privacy", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/register", function (req, res) {
    res.render("register", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/schedule", function (req, res) {
    res.render("schedule", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/sponsors", function (req, res) {
    res.render("sponsors", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  router.get("/venues", function (req, res) {
    res.render("venues", {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    });
  });

  return router;
};
