"use strict";

var fs        = require("fs"),
    path      = require("path"),
    Sequelize = require("sequelize");

module.exports = function (env) {
    // Connect
    var sequelize = new Sequelize(env.DATABASE_URL, {
            timestamps: true,
            paranoid: true,
            logging: (process.env.PG_LOG === "true") ? console.log : false, // Switch to `console.log` for output.
        }),
        db        = {};
    
    // Read in schemas.
    fs.readdirSync(__dirname)
        .filter(function (file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach(function (file) {
            var model = sequelize["import"](path.join(__dirname, file));
            db[model.name] = model;
        });

    // Associate.
    Object.keys(db).forEach(function (modelName) {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db);
        }
    });
    
    // Auxilary.
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
};
