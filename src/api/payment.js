"use strict";

var middleware = require("../utils/middleware"),
    alert = require("../utils/alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(middleware.admin, function (req, res) {
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

    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Payment.findOne({
            where: {
                id: req.params.id,
                AccountId: req.session.account.id,
            },
        }).then(function (payment) {
            if (!payment) { throw new Error("Payment not found."); }
            return payment.destroy();
        }).then(function (member) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Payment deleted.");
                    res.redirect('/account/payments');
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
    .put(middleware.admin, function (req, res) {
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
