'use strict';

var async = require('async'),
    _     = require('lodash');

module.exports = function(data) {
    var router = require('express').Router(),
        Group = require('../schema/Group'),
        Payment = require('../schema/Payment'),
        util = require('./util');

    router.get('/payments', util.auth, function (req, res) {
        Group.findById(req.session.group._id)
            .populate('_payments')
            .populate('_members')
            .exec(function (err, group) {
                if (!err && group) {
                    async.auto({
                        paid: group.getPaid.bind(group),
                        cost: group.getCost.bind(group)
                    }, function complete(err, data) {
                        if (!err && data.paid !== null && data.cost !== null) {
                            group.save();
                            res.render('payments', {
                                title   : 'Payments',
                                session : req.session,
                                group   : group,
                                cost    : data.cost,
                                paid    : data.paid,
                                early   : group._members.filter(function (v) { return v._state.ticketType === 'Early'; }).length,
                                regular : group._members.filter(function (v) { return v._state.ticketType === 'Regular'; }).length
                            });
                        } else {
                            res.send('Sorry, there was an error, please try again.');
                            console.error(err);
                        }
                    });
                } else {
                    res.send('Sorry, there was an error finding your group. Try again?');
                    console.error(err);
                }
            });
    });

    router.post('/payment', util.admin, function (req, res) {
        var group;
        async.waterfall([
            function createPayment(next) {
                Payment.create({
                    amount      : req.body.amount,
                    type        : req.body.type,
                    number      : req.body.number,
                    description : req.body.description,
                    date        : new Date(req.body.month + ' ' + req.body.day + ', ' + req.body.year),
                    _group      : req.session.group._id
                }, next);
            },
            function getGroup(payment, next) {
                // The Schema ensures that the payment is in the group already.
                Group.findById(req.session.group._id).exec(next);
            },
            function getPaid(foundGroup, next) {
                group = foundGroup;
                group.getPaid(next);
            },
            function setPaidAndSave(paid, next) {
                group._state.balance.paid = paid;
                if (group._state.balance.paid >= group._state.balance.cost) {
                    group._state.steps.payments = true;
                }
                group.save(next);
            }
        ], function complete(err, result) {
            if (err) {
                var message = "Something didn't work out. Try again?";
                res.redirect('/account?message=' + message);
                console.error(err);
            } else {
                req.session.group = result;
                res.redirect('/account#payments');
            }
        });
    });

    router.get('/payment/delete/:id', util.admin, function (req, res) {
        var groupId, group;
        async.waterfall([
            function getPayment(next) {
                Payment.findById(req.params.id).exec(next);
            },
            function removePayment(payment, next) {
                groupId = payment._group;
                payment.remove(next);
            },
            function getGroup(payment, next) {
                Group.findById(groupId).exec(next);
            },
            function unsetPaymentsAndGetPaid(foundGroup, next) {
                group = foundGroup;
                group._state.steps.payments = false;
                group.getPaid(next);
            },
            function getPaidAndSave(paid, next) {
                group._state.balance.paid = paid;
                group.save(next);
            }
        ], function complete(err, result) {
            if (err) {
                console.error(err);
                res.redirect('/account?message=' + err);
            } else {
                req.session.group = result; // Is the group
                res.redirect('/account');
            }
        });
    });

    return router;
};
