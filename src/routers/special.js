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
                    // Admin Table
                    member: member,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    return router;
};
