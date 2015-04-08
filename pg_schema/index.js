"use strict";

var fs        = require("fs"),
    path      = require("path"),
    Sequelize = require("sequelize"),
    env       = process.env.NODE_ENV || "development",
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        timestamps: true,
        paranoid: true,
        logging: (process.env.PG_LOG === "true") ? console.log : false, // Switch to `console.log` for output.
    }),
    db        = {};

fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        var model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
