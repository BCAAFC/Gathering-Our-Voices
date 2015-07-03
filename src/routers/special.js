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
            db.Workshop.findAll({ where: { approved: true, verified: true, }}),
            function (page, workshops) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache(),
                    workshops: workshops,
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
            db.Workshop.findOne({ where: { id: req.params.id, }}),
            function (page, workshop) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
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
