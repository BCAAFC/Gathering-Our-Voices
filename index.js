/**
 * Gathering Our Voices
 * @author Andrew Hobden <andrew@hoverbear.org>
 */
"use strict";

// Check the environment.
var env = require("./src/env")();

// Connect to the database.
var db = require("./src/db")(env);
if (env.FIRSTRUN == "true") {
    require("./src/firstrun")(env, db);
}

// Connect to redis.
var redis = require("./src/redis")(env);

// Fire up the HTTP server.
var httpd = require("./src/httpd")(env, db, redis);

// Assign the routers to the server.
httpd = require("./src/routers")(httpd, db, redis);

httpd.listen(env.PORT, function () {
    console.log("Listening on " + env.PORT);
});

// Start up one time cron jobs.
var cronjobs = require("./src/cronjobs")(db);

// One time job.
// (function() {
//     db.Workshop.sync()
//         .catch(function () {})
//         .then(function () {
//             db.Workshop.findAll().then(function (wkshps) {
//                 return wkshps.map(function (wkshp) {
//                     return db.Account.findOne({
//                         where: { id: wkshp.AccountId }
//                     }).then(function (acc) {
//                         console.log(wkshp.toJSON());
//                         console.log(acc.toJSON());
//                         console.log("Adding wkshp", wkshp.id, "to acc", acc.id);
//                         acc.addWorkshop(wkshp);
//                         acc.save();
//                     });
//                 });
//             });
//         });
// })();

module.exports = httpd;
