var Promise = require("bluebird");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/accounts", function (req, res) {
        console.log(req.originalUrl);
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Account.findAll({ include: [{all: true, attributes: ['id'] }]}),
            function (page, accounts) {
                var columns = Object.keys(db.Account.attributes)
                    .filter(function (v) { return v !== "password"; })
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                columns.push({ title: "Group", data: "Group", className: "Group", });
                columns.push({ title: "Exhibitor", data: "Exhibitor", className: "Exhibitor", });
                columns.push({ title: "Workshop", data: "Workshop", className: "Workshop", });
                columns.push({ title: "Volunteer", data: "Volunteer", className: "Volunteer", });
                console.log(JSON.stringify(accounts, null, 2));
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    // Admin Table
                    data: accounts,
                    columns: columns,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/members", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Member.findAll(),
            function (page, members) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    members: members,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/workshops", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Workshop.findAll(),
            function (page, workshops) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    workshops: workshops,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/exhibitors", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Exhibitor.findAll(),
            function (page, exhibitors) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    exhibitors: exhibitors,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/sessions", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Session.findAll(),
            function (page, sessions) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    sessions: sessions,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/payments", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Payment.findAll(),
            function (page, payments) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    payments: payments,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/volunteers", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Volunteer.findAll(),
            function (page, volunteers) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    volunteers: volunteers,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });


    router.get("/editor", function (req, res) {
        db.Page.findAll({}).then(function (pages) {
            res.render("editor", {
                pages: pages,
                admin: req.session.isAdmin,
            });
        });
    });

    return router;
};
