var fs = require("fs");

module.exports = function (env, db) {
    db.sequelize.sync().then(function () {
        return db.Page.create({
            path: "/register",
            title: "Register",
            content: fs.readFileSync("views/firstrun/register.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/login",
            title: "Login",
            content: fs.readFileSync("views/firstrun/login.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/news",
            title: "News",
            content: fs.readFileSync("views/firstrun/news.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/conduct",
            title: "Code of Conduct",
            content: fs.readFileSync("views/firstrun/conduct.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/about",
            title: "About",
            content: fs.readFileSync("views/firstrun/about.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/schedule",
            title: "Schedule",
            content: fs.readFileSync("views/firstrun/schedule.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/venues",
            title: "Venues",
            content: fs.readFileSync("views/firstrun/venues.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/faq",
            title: "F.A.Q.s",
            content: fs.readFileSync("views/firstrun/faq.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return db.Page.create({
            path: "/privacy",
            title: "Privacy Policy",
            content: fs.readFileSync("views/firstrun/privacy.hbs", { encoding: "utf8", }),
        });
    }).then(function () {
        return console.log("Done $FIRSTRUN.");
    });
};
