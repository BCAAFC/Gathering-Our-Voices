var Promise = require("bluebird"),
    fs = require("fs");


module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/account/group/member/:id", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: "/account/group/member" }, }),
            db.Member.findOne({ where: { id: req.params.id, }}),
            function (page, member) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache(),
                    member: member,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.get("/workshops", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: "/workshops" }, }),
            db.Workshop.findAll({
                where: { approved: true, verified: true, },
                attributes: ['id', 'title', 'facilitators', 'length', 'category', 'audience'],
                include: [db.Session],
            }),
            function (page, workshops) {
                var columns = [
                    { title: "View", data: null, className: "view", },
                    { title: 'Title', data: 'title', className: 'title' },
                    { title: 'Facilitators', data: 'facilitators', className: 'facilitators' },
                    { title: 'Length', data: 'length', className: 'length' },
                    { title: 'Category', data: 'category', className: 'category' },
                    { title: 'Audience', data: 'audience', className: 'audience' },
                    { title: 'Sessions', data: 'Sessions', className: 'sessions' },
                ];
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

    router.get("/workshops/:id", function (req, res) {
        Promise.join(
            db.Page.findOne({ where: { path: "/workshops/:id" }, }),
            db.Workshop.findOne({
                where: { id: req.params.id, },
                include: [db.Session],
            }),
            new Promise(function (resolve, reject) {
                if (req.session.account) {
                    // Refresh account information.
                    return resolve(db.Account.findOne({
                        where: { id: req.session.account.id, },
                        // TODO: Only members.
                        include: [{ all: true, nested: true, }],
                    }).then(function (account) {
                        req.session.account = account;
                        return account;
                    }));
                } else {
                    return resolve(null);
                }
            }),
            function (page, workshop, account) {
                page.render(res, "default", {
                    title: page.title,
                    account: account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache(),
                    workshop: workshop,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    return router;
};
