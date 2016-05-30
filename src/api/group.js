"use strict";

var middleware = require("../utils/middleware"),
    alert = require("../utils/alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    // Group creation.
    .post(middleware.auth, function (req, res) {
        // Strip
        if (!req.session.isAdmin) {
            delete req.body.tags;
        }
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [ db.Group ],
        }).then(function (account) {
            return [account, account.getGroup()];
        }).spread(function (account, group) {
            if (group) { throw new Error("Already has a group associated"); }
            req.body.youthInCare = Number(req.body.youthInCare);
            req.body.youthInCareSupport = Number(req.body.youthInCareSupport);
            return account.createGroup(req.body);
        }).then(function (group) {
            return group.getAccount({ include: [ db.Group ]});
        }).then(function (account) {
            req.session.account = account;
            res.format({
                'text/html': function () {
                    alert.success(req, "Group Declared.");
                    res.redirect('/account/group');
                },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            console.log(error);
            res.format({
                'text/html': function () {
                    alert.error(req, error.message);
                    res.redirect('/account');
                },
                'default': function () {
                    res.status(401).json({ error: error.message });
                },
            });
        });
    });

    router.route("/:id")
    // Edit an group. Need to verify is valid in fn.
    .put(function (req, res) {
        db.Group.findOne({
            where: { id: req.params.id, },
        }).then(function (group) {
            if (!group) { throw new Error("Group doesn't exist"); }
            if (group.AccountId !== req.session.account.id && !req.session.isAdmin) {
                throw new Error("Group is not related to this account.");
            }
            // Edit details in a batch.
            group.affiliationType = req.body.affiliationType || group.affiliationType;
            group.paymentPlans = req.body.paymentPlans || group.paymentPlans;
            group.youthInCare = req.body.youthInCare || group.youthInCare;
            group.youthInCareSupport = req.body.youthInCareSupport || group.youthInCareSupport;
            // Admin
            if (req.session.isAdmin) {
                group.tags = req.body.tags;
            }
            // Save.
            return group.save();
        }).then(function (group) {
            return group.getAccount({ include: [ db.Group ]});
        }).then(function (account) {
            req.session.account = account;
            res.format({
                'text/html': function () {
                    alert.success(req, "Group Updated.");
                    res.redirect('/account');
                },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            res.format({
                'text/html': function () {
                    alert.error(req, error.message);
                    res.redirect('/account');
                },
                'default': function () {
                    res.status(401).json({ error: error.message });
                },
            });
        });
    });

    // Delete a group.
    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Group.findOne({
            where: { id: req.params.id, },
            include: [ db.Account ],
        }).then(function (group) {
            return [group, group.getAccount(), ];
        }).spread(function (group, account) {
            if (!group) { throw new Error("Group doesn't exist"); }
            if (account.id !== req.session.id && !req.session.isAdmin) {
                throw new Error("Group is not related to this account.");
            }
            return group.destroy();
        }).then(function () {
            res.format({
                'text/html': function () {
                    alert.success(req, "Group deleted.");
                    res.redirect('/admin/groups');
                },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/:id/tags")
    .put(middleware.admin, function (req, res) {
        db.Group.findOne({
            where: { id: req.params.id, },
        }).then(function (group) {
            if (group.tags.indexOf(req.body.add) !== -1) {
                throw new Error("Tag already exists.");
            } else {
                group.tags.push(req.body.add);
                return group.save({fields: ['tags']});
            }
        }).then(function (group) {
            res.status(200).json(group.tags);
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    })
    .delete(middleware.admin, function (req, res) {
        db.Group.findOne({
            where: { id: req.params.id, },
        }).then(function (group) {
            var idx = group.tags.indexOf(req.body.remove);
            if (idx !== -1) {
                group.tags.splice(idx, 1);
                return group.save({fields: ['tags']});
            } else {
                throw new Error("Tag does not exist.");
            }
        }).then(function (group) {
            res.status(200).json(group.tags);
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    return router;
};
