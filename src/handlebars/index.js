"use strict";

var fs        = require("fs"),
    path      = require("path");

module.exports = function setup(hbs) {

    // Read in schemas.
    fs.readdirSync(__dirname)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function (file) {
            require('./' + file)(hbs);
        });

    return hbs;
};
