var Promise = require("bluebird"),
    fs = require("fs"),
    alert = require("../alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [db.Workshop, db.Exhibitor, db.Group],
        }).then(function (account) {
            req.session.account = account;
            res.render("account/index", {
                title: "Account - Index",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    router.route("/details")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
        }).then(function (account) {
            req.session.account = account;
            res.render("account/account", {
                title: "Account - Details",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    router.route("/group")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [{ model: db.Group, include: [db.Member] },]
        }).then(function (account) {
            req.session.account = account;
            res.render("account/group", {
                title: "Account - Group",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    router.route("/workshop")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [{ model: db.Workshop, include: [{ model: db.Session, include: db.Member}] }]
        }).then(function (account) {
            req.session.account = account;
            res.render("account/workshop", {
                title: "Account - Workshop",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    router.route("/exhibitor")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [db.Exhibitor]
        }).then(function (account) {
            req.session.account = account;
            res.render("account/exhibitor", {
                title: "Account - Exhibitor",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    router.route("/volunteer")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [db.Volunteer]
        }).then(function (account) {
            req.session.account = account;
            res.render("account/volunteer", {
                title: "Account - Volunteer",
                account: account,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
                alert: req.alert,
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/login");
        });
    });

    return router;
};
