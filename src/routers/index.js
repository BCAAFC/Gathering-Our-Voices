'use strict';

var middleware = require("../utils/middleware"),
    moment = require("moment"),
    Promise = require("bluebird");

var memberCountCache = {
  count: 0,
  lastCheck: moment("Jan 1 1970", "MMM DD YYYY"), // Epoch, force this to update.
};

function getMemberCount(db) {
  if (moment(new Date()).subtract(5, "minutes") > memberCountCache.lastCheck) {
    console.log("Hitting the DB");
    return db.Member.count().then(function (count) {
      memberCountCache.count = count;
      memberCountCache.lastCheck = moment(new Date());
      return count;
    });
  } else {
    console.log("Not hitting the DB");
    return new Promise(function (resolve, reject) {
      return resolve(memberCountCache.count);
    });
  }
}

module.exports = function (httpd, db, redis) {

  httpd.get("/", function (req, res) {
    getMemberCount(db).then(function (count) {
      res.render("index", {
        title: "Landing Page",
        layout: null,
        memberCount: count,
        account: req.session.account,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
      });
    });
  });

  httpd.use("/api",
  require("../api")(db, redis));

  httpd.use(function (req, res, next) {
    // Consume message.
    if (req.session.alert) {
      req.alert = req.session.alert;
      delete req.session.alert;
    }
    return next();
  });

  // Workshop routes
  httpd.use("/workshops",
  require("./workshops")(db, redis));

  // Account routes.
  httpd.use("/account",
  middleware.auth,
  require("./account")(db, redis));

  // Admin routes.
  httpd.use("/admin",
  middleware.admin,
  require("./admin")(db, redis));

  // It's quite important that this is last.
  httpd.use("/",
  require("./pages")(db, redis));

  // 404
  httpd.use(function notFoundHandler(req, res) {
    res.status(404);
    console.warn('Path `' + req.originalUrl + '`does not exist.');
    res.send('Path `' + req.originalUrl + '`does not exist.');
  });

  return httpd;
};
