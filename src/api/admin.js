'use strict';

var middleware = require("../utils/middleware"),
    config     = require("../../config/config");

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
            if (config.datasourceKey !== null && key !== config.datasourceKey) {
                reject(new Error("Key is invalid."));
            } else {
                resolve(db[model].findAll({ order: "id", raw: true }));
            }
        }).then(data => {
            return new Promise((resolve, reject) => {
                csv_stringify(data, { header: true, quoted: true, qoutedString: true }, (err, out) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(out);
                    }
                });
            });
        }).then(out => {
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
