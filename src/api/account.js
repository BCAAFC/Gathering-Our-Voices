'use strict';

var config = require("../../config/config");

var middleware = require("../utils/middleware"),
    alert = require("../utils/alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    // Authenticate and login.
    router.post("/auth", function (req, res) {
        db.Account.auth(req.body.email.toLowerCase(), req.body.password).then(function (account) {
            req.session.account = account;
            if (config.admins.indexOf(account.email) !== -1) {
                req.session.isAdmin = true;
            }
            res.format({
                'text/html': function () { res.redirect(req.body.redirect || '/account'); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            console.log(error);
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    // Logout.
    router.get("/logout", function (req, res) {
        if (req.session.account) { delete req.session.account; }
        if (req.session.isAdmin) { delete req.session.isAdmin; }
        res.format({
            'text/html': function () { res.redirect('/'); },
            'default': function () { res.status(200).json({}); },
        });
    });

    router.route("/")
    // Account creation.
    .post(function (req, res) {
        if (!req.body.robots || req.body.robots.trim().toLowerCase() !== "kelowna") {
            alert.error(req, "Please fill in the human testing question. The answer should be very straightforward.");
            res.redirect('back');
            return; // Finish
        }

        // Strip
        if (!req.session.isAdmin) {
            delete req.body.notes;
        }
        // Create
        db.Account.create(req.body).then(function (account) {
            req.session.account = account;
            if (config.admins.indexOf(account.email) !== -1) {
                req.session.isAdmin = true;
            }
            res.format({
                'text/html': function () { res.redirect('/account'); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            if (error.name == 'SequelizeUniqueConstraintError') {
                res.format({
                    'text/html': function () {
                        alert.error(req, "That email already exists in our system. Did you forget your password?");
                        res.redirect('back');
                    },
                    'default': function () { res.status(401).json({ error: error.message }); },
                });
            } else {
                res.format({
                    'text/html': function () {
                        alert.error(req, error.message);
                        res.redirect('back');
                    },
                    'default': function () { res.status(401).json({ error: error.message }); },
                });
            }
        });
    });

    router.route("/:id")
    // Edit an account.
    .put(middleware.ownAccount, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist"); }
            if (req.body.password === "") {
                req.body.password = null;
            }
            // Edit details in a batch.
            account.email = req.body.email || account.email;
            account.password = req.body.password || account.password;
            account.name = req.body.name || account.name;
            account.affiliation = req.body.affiliation || account.affiliation;
            account.phone = req.body.phone || account.phone;
            account.fax = req.body.fax || account.fax;
            account.address = req.body.address || account.address;
            account.city = req.body.city || account.city;
            account.province = req.body.province || account.province;
            account.postalCode = req.body.postalCode || account.postalCode;
            // Admin stuff.
            if (req.session.isAdmin) {
                account.notes = req.body.notes;
            }
            // Save.
            return account.save();
        }).then(function (account) {
            alert.success(req, "Changes saved.");
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            alert.error(req, error.message);
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    // Delete an account.
    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist"); }
            return account.destroy();
        }).then(function () {
            res.format({
                'text/html': function () { res.redirect('/admin/accounts'); },
                'default': function () { res.status(200).json({}); },
            });
        }).catch(function (error) {
            console.log(error);
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('/admin/accounts'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/recovery")
    .get(function (req, res) {
        // Finish recovery
        db.Account.findOne({
            where: { email: req.query.email, },
        }).then(function (account) {
            if (account === null) { throw new Error("Account does not exist"); }
            return account.recoveryFinish(req.query.key);
        }).then(function (account) {
            req.session.account = account;
            alert.success(req, "Success! Please remember to change your password.");
            res.redirect("/account/details");
        }).catch(function (error) {
            console.log(error);
            alert.error(req, error.message);
            res.redirect("/login");
        });
    })
    .post(function (req, res) {
        // Start recovery
        db.Account.findOne({
            where: { email: req.body.email, },
        }).then(function (account) {
            if (account === null) { throw new Error("Account does not exist"); }
            return account.recoveryStart().then(function () {
                alert.success(req, "Recovery email sent. Please check your mailbox.");
                res.send();
            });
        }).catch(function (err) {
            console.log(err);
            alert.error(req, "Unable to send recovery email. Please contact us.");
            res.send();
        });
    });

    router.route("/:id/notes")
    .put(middleware.admin, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist!"); }
            account.notes = req.body.notes;
            return account.save();
        }).then(function () {
            res.format({
                'text/html': function () { res.redirect("back"); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (err) {
            console.log(err);
            alert.error(req, err);
            res.send();
        });
    });

    router.route("/:id/checkin")
    .get(middleware.admin, function (req, res) {
        db.Account.find({
            where: { id: req.params.id },
        }).then(function (account) {
            target = true;
            if (account && account.misc && account.misc.checkin) {
                target = false;
            }
            return account.update({
                misc: { checkin: target },
            });
        }).then(function (account) {
            res.status(200).json(account.misc.checkin);
        }).catch(function (err) {
            alert.error(req, err);
            res.send();
        });
    });

    return router;
};
