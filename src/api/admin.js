"use strict";

var middleware = require("../middleware");

var csv_stringify = require("csv-stringify");

module.exports = (db, redis) => {
    var router = require("express").Router();

    // This route is **not** middleware authenticated since Excel can't do this.
    // Instead we use a predetermined key.
    router.route("/csv/:model")
    .get((req, res) => {
        return new Promise((resolve, reject) => {
            var model = req.params["model"].toLowerCase(),
                key = req.query["key"];
            // Capitalize as expected.
            model = model.charAt(0).toUpperCase() + model.slice(1)
            // Make sure key is right.
            if (process.env.DATASOURCE_KEY !== null && key !== process.env.DATASOURCE_KEY) {
                reject(new Error("Key is invalid."));
            } else {
                console.log("Key is fine");
                resolve(db[model].findAll({ order: "id", raw: true }));
            }
        }).then(data => {
            console.log("Into next promise");
            return new Promise((resolve, reject) => {
                console.log("Got data")
                csv_stringify(data, { header: true, escape: true }, (err, out) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(out);
                    }
                });
            });
        }).then(out => {
            console.log("Sending");
            res.contentType("text/csv");
            res.setHeader('Content-disposition', 'attachment; filename=data.csv');
            return res.send(out);
        }).catch(err => {
            console.warn(err);
            res.send(err.message);
        });
    });

    return router;
}
