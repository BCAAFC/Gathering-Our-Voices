var Promise = require("bluebird"),
    fs = require("fs");

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
                    flags: db.Flag.cache(),
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
                    flags: db.Flag.cache(),
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
                    flags: db.Flag.cache(),
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
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl.split("?")[0] }, }),
            db.Workshop.findAll({
                include: [db.Session],
            }),
            function (page, workshops) {
                var columns = Object.keys(db.Workshop.attributes)
                    .map(function (v) {
                        var val = v[0].toUpperCase() + v.slice(1);
                        return { title: val, data: v, className: v };
                    });
                columns.unshift({ title: "Sessions", data: "Sessions", className: "Sessions", });
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache(),
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
        Promise.join(
            db.Page.findOne({ where: { path: req.originalUrl.split("?")[0] }, }),
            db.Exhibitor.findAll(),
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
                    flags: db.Flag.cache(),
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
                    flags: db.Flag.cache(),
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
                    flags: db.Flag.cache(),
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
                    flags: db.Flag.cache(),
                    volunteers: volunteers,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/images", function (req, res) {
        fs.readdir(process.env.UPLOAD_DIR + "images/", function (err, files) {
            if (err) {
                alert.error(req, err.message);
                console.log(err);
                return res.redirect("back");
            }
            files = files
                .filter(function (val) { return val[0] !== '.'; })
                .map(function (val) { return val.split(".").shift(); });
            db.Page.findOne({
                where: { path: "/admin/images", },
            // I don't like this but I don't really see a nice way of collapsing this into a reusable.
            }).then(function (page) {
                if (!page) {
                    throw new Error("Path `" + req.originalUrl + "`does not exist.");
                } else if (page.requirements === "Normal") {
                    return page;
                } else {
                    if (page.requirements === "Authenticated" && !req.session.account) {
                        throw new Error("You are not authenticated.");
                    } else if (page.requirements === "Administrator" && !req.session.isAdmin) {
                        throw new Error("You are not an administrator");
                    }
                    // Refresh account information.
                    return db.Account.findOne({
                        where: { id: req.session.account.id, },
                        include: [{ all: true, nested: true, }]
                    }).then(function (account) {
                        req.session.account = account;
                        return page;
                    });
                }
            }).then(function (page) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    flags: db.Flag.cache(),
                    alert: req.alert,
                    files: files,
                });
            }).catch(function (error) {
                console.warn(error.message);
                res.status(404).send(error.message);
            });
        });
    });

    router.get("/editor", function (req, res) {
        db.Page.findAll({}).then(function (pages) {
            res.render("editor", {
                pages: pages,
                admin: req.session.isAdmin,
                flags: db.Flag.cache(),
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

    router.get("/manage/:id/:target", function (req, res) {
        db.Account.findOne({
            where: { id: req.params.id, },
        }).then(function (account) {
            if (!account) { throw new Error("Account does not exist."); }
            req.session.account = account;
            res.redirect("/account/" + req.params.target);
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.get("/flag/:keyword/:value", function (req, res) {
        db.Flag.findOrCreate({ where: { keyword: req.params.keyword, }
        }).spread(function (flag, created) {
            if (req.params.value === "true") {
                flag.value = true;
            } else {
                flag.value = false;
            }
            return flag.save();
        }).then(function () {
            res.format({
                'text/html': function () { alert.success(req, "Flag set."); res.redirect('back'); },
                'default': function () { res.status(200).json({ message: "Flag set." }); },
            });
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    return router;
};
