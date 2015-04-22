module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Payment, },
            ],
        }).then(function (account) {
            return account.createPayment(req.body);
        }).then(function (payment) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(payment); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id")
    .put(function (req, res) {
        db.Payment.findOne({
            where: { id: req.params.id },
        }).then(function (payment) {
            // Validations.
            if (payment.AccountId !== req.session.account.id) {
                throw new Error("That payment is not associated with this account.");
            }
            return payment;
        }).then(function (payment) {
            payment.date = req.body.date || payment.date;
            payment.amount = req.body.amount || payment.amount;
            payment.number = req.body.number || payment.number;
            payment.type = req.body.type || payment.type;
            payment.description = req.body.description || payment.description;
            return payment.save();
        }).then(function (payment) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
