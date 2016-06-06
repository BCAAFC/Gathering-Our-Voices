'use strict';

var hbs = require("hbs"),
url = require("url");

module.exports = function (db, redis) {
  var router = require("express").Router();

  router.get("/*", function (req, res) {
    db.Page.render(res, "layout", url.parse(req.originalUrl).pathname, {
      account: req.session.account,
      flags: db.Flag.cache,
      admin: req.session.isAdmin,
      alert: req.alert,
    }).catch(error => {
      console.warn(error.message);
      res.status(404).send(error.message);
    });
  });

  return router;
};
