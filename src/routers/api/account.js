module.exports = function (db, redis) {
    var router = require("express").Router();

    router.post("/", function (req, res) {
        db.Account.create(req.body).then(function (account) {
            req.session.account = account;
            res.format({
              'application/json': function () { res.json(account); },
              'default': function () { res.redirect("/account"); },
            });
        }).catch(function (error) {
            // TODO HTML Errors.
            res.status(401).json({ error: error.message });
        });
    });

    router.post("/auth", function (req, res) {
        db.Account.auth(req.body.email, req.body.password).then(function (account) {
            req.session.account = account;
            res.format({
              'application/json': function () { res.json(account); },
              'default': function () { res.redirect("/account"); },
            });
        }).catch(function (error) {
            // TODO HTML Errors.
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
