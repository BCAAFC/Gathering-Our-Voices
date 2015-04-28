var Promise = require("bluebird");

// These all look the same, but expect them to differ later.

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/accounts", function (req, res) {
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

    router.get("/groups", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl }, }),
            db.Group.findAll(),
            function (page, groups) {
                var columns = Object.keys(db.Group.attributes)
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    // Admin Table
                    data: groups,
                    columns: columns
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
                var columns = Object.keys(db.Member.attributes)
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    // Admin Table
                    data: members,
                    columns: columns
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/workshops", function (req, res) {
        var query;
        if (req.query.approved === "false") {
            query = { approved: false, };
        } else {
            query = { approved: true, };
        }
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl.split("?")[0] }, }),
            db.Workshop.findAll({ where: query }),
            function (page, workshops) {
                var columns = Object.keys(db.Workshop.attributes)
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    data: workshops,
                    columns: columns,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/exhibitors", function (req, res) {
        var query;
        if (req.query.approved === "false") {
            query = { approved: false, };
        } else {
            query = { approved: true, };
        }
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl.split("?")[0] }, }),
            db.Exhibitor.findAll({ where: query }),
            function (page, exhibitors) {
                var columns = Object.keys(db.Exhibitor.attributes)
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    data: exhibitors,
                    columns: columns,
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

    router.get("/manage/:id", function (req, res) {
        db.Account.findOne({
            where: { id: req.params.id, },
        }).then(function (account) {
            if (!account) { throw new Error("Account does not exist."); }
            req.session.account = account;
            res.redirect("/account");
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    return router;
};
