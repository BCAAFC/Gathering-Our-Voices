#! /bin/env node

var fs = require("fs");

// Check the environment.
if (!process.env.PG_URL) {
    console.log("$PG_URL not specified");
    process.exit(1);
}
console.log("$PG_URL =", process.env.PG_URL);
console.log("$PG_LOG =", process.env.PG_LOG)

// Connect to the database.
var db = require("./src/db")();

db.sequelize.sync().then(function () {
    return db.Page.create({
        path: "/register",
        title: "Register",
        content: fs.readFileSync("setup/register.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/login",
        title: "Login",
        content: fs.readFileSync("setup/login.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/news",
        title: "News",
        content: fs.readFileSync("setup/news.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/conduct",
        title: "Code of Conduct",
        content: fs.readFileSync("setup/conduct.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/about",
        title: "About",
        content: fs.readFileSync("setup/about.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/schedule",
        title: "Schedule",
        content: fs.readFileSync("setup/schedule.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/venues",
        title: "Venues",
        content: fs.readFileSync("setup/venues.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/faq",
        title: "F.A.Q.s",
        content: fs.readFileSync("setup/faq.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return db.Page.create({
        path: "/privacy",
        title: "Privacy Policy",
        content: fs.readFileSync("setup/privacy.hbs", { encoding: "utf8", }),
    });
}).then(function () {
    return console.log("Done setup. You're good to go!");
});
