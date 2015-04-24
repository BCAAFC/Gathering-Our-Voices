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
            return account.createExhibitor(req.body);
        }).then(function (workshop) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(workshop); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
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
            return exhibitor.save();
        }).then(function (exhibitor) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(exhibitor); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
