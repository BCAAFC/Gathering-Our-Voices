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
            account.password = null;
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

    router.route("/payments")
    .get(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id, },
            include: [db.Payment],
        }).then(function (account) {
            req.session.account = account;
            res.render("account/payments", {
                title: "Account - Payments",
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
            include: [
                { model: db.Group,
                    include: [db.Member,],
                },
            ],
            order: [ [ db.Group, db.Member, "name", ], ],
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

    router.route("/group/member/:id?")
    .get(function (req, res) {
        Promise.join(
            db.Account.findOne({
                where: { id: req.session.account.id, },
                include: [db.Group],
            }),
            db.Member.findOne({
                where: { id: req.params.id, },
                include: [{
                    model: db.Session,
                    include: [db.Workshop],
                }],
            }),
            function (account, member) {
                if (member && (account.Group.id !== member.GroupId)) {
                    throw new Error("Member is not in that group");
                }
                req.session.account = account;
                res.render("account/member", {
                    title: "Account - Member",
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    flags: db.Flag.cache(),
                    alert: req.alert,
                    member: member,
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

    router.route("/workshop/session/:id?")
    .get(function (req, res) {
        Promise.join(
            db.Account.findOne({
                where: { id: req.session.account.id, },
                include: [{ model: db.Workshop, }]
            }),
            new Promise(function (resolve, reject) {
                if (req.params.id) {
                    // Refresh account information.
                    return resolve(db.Session.findOne({
                        where: { id: req.params.id, },
                        include: [db.Member],
                    }).then(function (session) {
                        return session;
                    }));
                } else {
                    return resolve(null);
                }
            }),
            function (account, session) {
                req.session.account = account;
                res.render("account/session", {
                    title: "Account - Session",
                    account: account,
                    admin: req.session.isAdmin,
                    flags: db.Flag.cache(),
                    alert: req.alert,
                    session: session,
                });
            }
        ).catch(function (error) {
            alert.error(req, error.message);
            res.redirect("/account");
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
