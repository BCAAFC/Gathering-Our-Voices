'use strict';

var async = require('async'),
    _     = require('lodash');

module.exports = function(data) {
    var router = require('express').Router(),
        Group  = require('../schema/Group'),
        Member = require('../schema/Member'),
        util   = require('./util');

    router.route('/register')
        .get(function (req, res) {
            res.render('register', {
                title    : 'Register or Log In',
                session  : req.session,
                lastForm : req.session.lastForm || {},
                waitlist : data.flags.waitlist
            });
        }).post(function (req, res) {
            if (req.body.passwordConfirm && req.body.passwordConfirm === req.body.password) {
                Group.create({
                    email           : req.body.email,
                    password        : req.body.password,
                    name            : req.body.name,
                    affiliation     : req.body.affiliation,
                    registrationDate: new Date(),
                    address         : req.body.address,
                    city            : req.body.city,
                    region          : req.body.region,
                    province        : req.body.province,
                    postalCode      : req.body.postalCode,
                    fax             : req.body.fax,
                    phone           : req.body.phone,
                    affiliationType : req.body.affiliationType,
                    _state: {
                        // Rest will be filled in from defaults.
                        // If it's 0 they're not on the waitlist.
                        waitlist: req.body.waitlist || 0
                    }
                }, function (err, group) {
                    if (!err) {
                        util.mail(group, 'GOV2015 New Registration', './mails/registration.md', [], function (err, result) {
                            req.session.group = group;
                            req.session.isAdmin = group.isAdmin();
                            res.redirect('/account');
                        });
                    } else if (err) {
                        var message;
                        if (err.code === 11000) {
                            message = "That email is already registered. Tried logging in?";
                        } else {
                            message = "You either missed a field required (Marked with a *), or there was an error.";
                        }
                        req.session.lastForm = req.body;
                        res.redirect("/register?message=" + message); // TODO: URL Encode
                    }
                });
            } else {
                var message = "The passwords did not match.";
                req.session.lastForm = req.body;
                res.status(401);
                res.redirect('/register?message=' + message);
            }
        });

    router.post('/login', function (req, res) {
        Group.login(req.body.email, req.body.password, function (err, group) {
            if (!err && group) {
                req.session.isAdmin = group.isAdmin();
                req.session.group   = group;
                res.redirect('/account');
            } else {
                console.error(err);
                var message = "The login details are incorrect, please double check them.";
                res.redirect('/register?message=' + message);
            }
        });
    });

    router.get('/logout', util.auth, function (req, res) {
        req.session.regenerate(function () {
            res.redirect('/');
        });
    });

    router.get('/checkoff/:id/:step', util.auth, function (req, res) {
        if (req.params.id === req.session.group._id || req.session.isAdmin) {
            if (req.param.step === 'checkin' && !req.session.isAdmin) {
                res.send('You do not have permission to check in');
                console.error('Attempt to checkin while not admin');
                return; // Early
            }
            var toggleAndSave = function toggleAndSave(group) {
                group._state.steps[req.params.step] = !group._state.steps[req.params.step];
                group.save(function (err) {
                    if (err) {
                        res.json({done: false, error: true});
                        console.error(err);
                    } else {
                        req.session.group = group;
                        res.json({done: group._state.steps[req.params.step]});
                    }
                });
            };
            Group.findById(req.params.id).exec(function (err, group) {
                if (req.params.step === 'payments') {
                    async.auto({
                        cost: group.getCost.bind(group),
                        paid: group.getPaid.bind(group)
                    }, function complete(err, data) {
                        if (data.paid >= data.cost) {
                            toggleAndSave(group);
                        } else {
                            res.json({done: false, error: true});
                        }
                    });
                } else if (req.params.step === 'members') {
                    if (group._state.steps.members === true) {
                        toggleAndSave(group);
                    } else {
                        async.auto({
                            chaperones: group.enoughChaperones.bind(group),
                            complete:   group.allComplete.bind(group)
                        }, function complete(err, data) {
                            if (data.chaperones && data.complete) {
                                toggleAndSave(group);
                            } else {
                                res.json({done: false, error: true});
                            }
                        });
                    }
                } else {
                    // No requirements
                    toggleAndSave(group);
                }

            });
        } else {
            res.send('You do not have permission to modify this group. Try again?');
            console.error('Group IDs did not match, or was not admin');
        }
    });

    router.post('/printout', util.auth, function (req, res) {
        Group.findById(req.session.group._id)
            .populate('_members').populate('_payments')
            .exec(function (err, group) {
                if (!err && group) {
                    async.auto({
                        cost: group.getCost.bind(group),
                        paid: group.getPaid.bind(group)
                    }, function complete(err, data) {
                        if (err) {
                            res.send('Sorry, there was an error getting payment details your group. Try again?');
                            console.error(err);
                        }
                        group.stats = _.reduce(group._members, function (sum, val) {
                            sum[val.type][val._state.ticketType] += 1;
                            return sum;
                        }, {
                            ''                : {'Early': 0, 'Regular': 0},
                            'Youth'           : {'Early': 0, 'Regular': 0},
                            'Young Adult'     : {'Early': 0, 'Regular': 0},
                            'Young Chaperone' : {'Early': 0, 'Regular': 0},
                            'Chaperone'       : {'Early': 0, 'Regular': 0}
                        });
                        res.render('printout', {
                            title   : 'Printout',
                            session : req.session,
                            group   : group,
                            cost    : data.cost,
                            paid    : data.paid
                        });
                    });
                } else {
                    res.send('Sorry, there was an error finding your group. Try again?');
                    console.error(err);
                }
            });
    });

    router.get('/recover/:email', function (req, res) {
        Group.findOne({email: req.params.email}, function (err, group) {
            if (!err && group) {
                var hash = Math.random().toString(36).slice(2);
                data.redis.set(hash, group._id, function (err, redisResponse) {
                    util.mail(group, 'Password Recovery', './mails/recovery.md', [{
                        name    : 'recovery',
                        content : 'https://gatheringourvoices.bcaafc.com/recovery/' + hash
                    }], function (err, result) {
                        var message = 'An email has been sent to you containing the needed information.';
                        res.send(message);
                    });
                });
            } else {
                res.send('Sorry, there was an error finding your group. Try again?');
                console.error(err);
            }
        });
    });

    router.get('/recovery/:hash', function (req, res) {
        data.redis.get(req.params.hash, function (err, response) {
            data.redis.del(req.params.hash);
            if (!err && response) {
                Group.findById(response).exec(function (err, group) {
                    if (!err && group) {
                        req.session.group = group;
                        res.redirect('/account');
                    } else {
                        res.send('Sorry, there was an error finding your group. Try again?');
                        console.error(err);
                    }
                });
            } else {
                console.error(err);
                var message = 'Something went wrong... Sorry!';
                res.redirect('/register?message=' + message);
            }
        });
    });

    router.get('/account', util.auth, function (req, res) {
        Group.findById(req.session.group._id)
            .populate("_members")
            .populate("_payments")
            .exec(function (err, group) {
                if (!err && group) {
                    async.auto({
                        enoughChaperones : group.enoughChaperones.bind(group),
                        allComplete      : group.allComplete.bind(group)
                    }, function complete(err, data) {
                        if (data.enoughChaperones && data.allComplete) {
                            // This will get done ~eventually~ and won't immediately reflect on the group.
                            Group.findById(req.session.group._id).exec(function (err, theGroup) {
                                if (!err) {
                                    theGroup._state.steps['members'] = true;
                                    theGroup.save();
                                }
                            });
                        }
                        res.render('account', {
                            session          : req.session,
                            title            : 'Account',
                            members          : group._members.sort(function (a,b) {
                                return a.name.localeCompare(b.name);
                            }),
                            payments         : group._payments,
                            enoughChaperones : data.enoughChaperones,
                            membersComplete  : data.allComplete
                        });
                    });
                } else {
                    res.send('Sorry, there was an error finding your group. Try again?');
                    console.error(err);
                }
            });
    });

    router.delete('/account/:id', util.admin, function (req, res) {
        Group.findById(req.params.id).exec(function remove(err, group) {
            if (!err) {
                group.remove(function (err) {
                    res.send("You've destroyed that group's dream of going to GOV, sadface.");
                });
            } else {
                console.error(err);
                res.send('There was an error doing that.');
            }
        });
    });

    router.post('/youthInCare', function (req, res) {
        Group.findById(req.session.group._id).exec(function (err, group) {
            if (!err && group) {
                group.youthInCare              = Number(req.body.youthInCare);
                group.youthInCareSupport       = Number(req.body.youthInCareSupport);
                group._state.steps.youthInCare = true;
                group.save(function (err, group) {
                    req.session.group = group;
                    if (!err) {
                        // req.session.group = group;
                        res.redirect('/account');
                    } else {
                        console.error(err);
                        var message = 'There was an error doing that... Try again?';
                        res.redirect('/account?message=' + message);
                    }
                });
            } else {
                console.error(err);
                var message = 'There was an error doing that... Try again?';
                res.redirect('/account?message=' + message);
            }
        });
    });

    router.route('/details')
        .get(util.auth, function (req, res) {
            Group.findById(req.session.group._id).exec(function (err, group) {
                if (!err && group) {
                    req.session.group = group;
                    res.render('details', {
                        session : req.session,
                        title   : 'Details',
                    });
                } else {
                    res.send('Sorry, there was an error finding your group. Try again?');
                    console.error(err);
                }
            });
        })
        .put(util.auth, function (req, res) {
            Group.findById(req.session.group._id).exec(function (err, group) {
                if (!err && group) {
                    group.email                = req.body.email;
                    group.password             = req.body.password;
                    group.name                 = req.body.name;
                    group.affiliation          = req.body.affiliation;
                    group.address              = req.body.address;
                    group.city                 = req.body.city;
                    group.region               = req.body.region;
                    group.province             = req.body.province;
                    group.postalCode           = req.body.postalCode;
                    group.fax                  = req.body.fax;
                    group.phone                = req.body.phone;
                    group.affiliationType      = req.body.affiliationType;
                    group._state.steps.details = true;
                    group.save(function (err, group) {
                        if (err) {
                            res.send('Sorry, there was an error saving your group. Try again?');
                            console.error(err);
                        } else {
                            req.session.group = group;
                            res.redirect('/account');
                        }
                    });
                } else {
                    res.send('Sorry, there was an error finding your group. Try again?');
                    console.error(err);
                }
            });
        });

    return router;
};
