var middleware = require("../../middleware");

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
            return account.createGroup(req.body);
        }).then(function (group) {
            return group.getAccount({ include: [ db.Group ]});
        }).then(function (account) {
            req.session.account = account;
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id")
    // Edit an group. Need to verify is valid in fn.
    .put(middleware.ownAccount, function (req, res) {
        db.Group.findOne({
            where: { id: req.params.id, },
            include: [ db.Account ],
        }).then(function (group) {
            return [group, group.getAccount(), ];
        }).spread(function (group, account) {
            console.log(req.body);
            if (!group) { throw new Error("Group doesn't exist"); }
            if (account.id !== req.session.id && !req.session.isAdmin) {
                throw new Error("Group is not related to this account.");
            }
            // Edit details in a batch.
            group.affiliationType = req.body.affiliationType || group.affiliationType;
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
            res.status(200).json(account);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    })
    // Delete a group.
    .delete(middleware.admin, function (req, res) {
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
            res.status(200).json({});
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
