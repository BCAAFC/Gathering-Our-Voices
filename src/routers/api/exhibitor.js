var middleware = require("../../middleware"),
    alert = require("../../alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Exhibitor, },
            ],
        }).then(function (account) {
            if (account.Exhibitor) { throw new Error("Already exhibitor associated with this account."); }
            // Transform HTML form.
            if (req.body.electrical === "Yes") { req.body.electrical = true; } else
            if (req.body.electrical === "No") { req.body.electrical = false; }
            if (req.body.delegateBags === "Yes") { req.body.delegateBags = true; } else
            if (req.body.delegateBags === "No") { req.body.delegateBags = false; }
            req.body.cost = 400;
            // Strip
            if (!req.session.isAdmin) {
                delete req.body.verified;
                delete req.body.approved;
                delete req.body.tags;
            }
            return account.createExhibitor(req.body);
        }).then(function (account) {
            res.format({
                'text/html': function () {
                    alert.sucess(req, "Exhibitor application created.");
                    res.redirect('back');
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

    router.route("/:id")
    .put(function (req, res) {
        db.Exhibitor.findOne({
            where: { id: req.params.id },
        }).then(function (exhibitor) {
            // Validations.
            if (exhibitor.id !== req.session.account.Exhibitor.id) {
                throw new Error("That exhibitor is not associated with this account.");
            }
            // Transform HTML form.
            if (req.body.electrical === "Yes") { req.body.electrical = true; } else
            if (req.body.electrical === "No") { req.body.electrical = false; }
            if (req.body.delegateBags === "Yes") { req.body.delegateBags = true; } else
            if (req.body.delegateBags === "No") { req.body.delegateBags = false; }

            return exhibitor;
        }).then(function (exhibitor) {
            exhibitor.representatives = req.body.representatives || exhibitor.representatives;
            exhibitor.categories = req.body.categories || exhibitor.categories;
            exhibitor.provides = req.body.provides || exhibitor.provides;
            exhibitor.electrical = req.body.electrical; // Can't do || exhibitor.electrical;
            exhibitor.delegateBags = req.body.delegateBags; // Can't do || exhibitor.representatives;
            exhibitor.payment = req.body.payment || exhibitor.payment;

            if (req.session.isAdmin) {
                exhibitor.verified = req.body.verified || exhibitor.verified;
                exhibitor.approved = req.body.approved || exhibitor.approved;
                exhibitor.tags = req.body.tags || exhibitor.tags;
            }

            return exhibitor.save();
        }).then(function (account) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Exhibitor application updated.");
                    res.redirect('back');
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

    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Exhibitor.findOne({
            where: { id: req.params.id, },
        }).then(function (exhibitor) {
            return exhibitor.destroy();
        }).then(function () {
            res.format({
                'text/html': function () {
                    alert.sucess(req, "Exhibitor deleted.");
                    res.redirect('back');
                },
                'default': function () { res.status(200).json({}); },
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
        db.Exhibitor.findOne({
            where: { id: req.params.id, },
        }).then(function (exhibitor) {
            if (exhibitor.tags.indexOf(req.body.add) !== -1) {
                throw new Error("Tag already exists.");
            } else {
                exhibitor.tags.push(req.body.add);
                return exhibitor.save({fields: ['tags']});
            }
        }).then(function (exhibitor) {
            res.status(200).json(exhibitor.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    })
    .delete(middleware.admin, function (req, res) {
        db.Exhibitor.findOne({
            where: { id: req.params.id, },
        }).then(function (exhibitor) {
            var idx = exhibitor.tags.indexOf(req.body.add);
            if (idx === -1) {
                exhibitor.tags.splice(idx, 1);
                return exhibitor.save({fields: ['tags']});
            } else {
                throw new Error("Tag does not exist.");
            }
        }).then(function (exhibitor) {
            res.status(200).json(exhibitor.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/approval")
    .put(middleware.admin, function (req, res) {
        db.Exhibitor.findOne({
            where: { id: req.params.id, },
        }).then(function (exhibitor) {
            if (!exhibitor) { throw new Error("Exhibitor does not exist."); }
            exhibitor.approved = req.body.approved;
            return exhibitor.save();
        }).then(function (exhibitor) {
            res.status(200).json({ state: exhibitor.approved, });
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/verification")
    .put(middleware.admin, function (req, res) {
        db.Exhibitor.findOne({
            where: { id: req.params.id, },
        }).then(function (exhibitor) {
            if (!exhibitor) { throw new Error("Exhibitor does not exist."); }
            exhibitor.verified = req.body.verified;
            return exhibitor.save();
        }).then(function (exhibitor) {
            res.status(200).json({ state: exhibitor.verified, });
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    return router;
};
