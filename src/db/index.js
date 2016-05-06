"use strict";

var fs        = require("fs"),
    path      = require("path"),
    Sequelize = require("sequelize");

module.exports = function setup() {
    // Connect
    var sequelize = new Sequelize(process.env.PG_URL, {
            timestamps: true,
            dialect: "postgres",
            // paranoid: true,
            logging: (process.env.PG_LOG === "true") ? console.log : false, // Switch to `console.log` for output.
        }),
        db = {};

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
            console.log("Associating " + modelName);
            db[modelName].associate(db);
        }
    });

    db.Group.findAll().catch(e => {
        if (e.message.includes("does not exist")) {
            console.log("This appears to be a firstrun. Running init.");
            require("../init.js")(db);
        }
    });

    // Auxilary.
    db.sequelize = sequelize;

    return db;
};
