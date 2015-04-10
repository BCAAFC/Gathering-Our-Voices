'use strict';

var async = require('async'),
    moment = require('moment'),
    _     = require('lodash');

module.exports = function(data) {
    var router = require('express').Router(),
        Member = require('../schema/Member'),
        Workshop = require('../schema/Workshop'),
        Group = require('../schema/Group'),
        Flag = require('../schema/Flag'),
        util = require('./util');

    router.route('/member')
        .post(util.auth, function (req, res) {
            if (!req.session.isAdmin && data.flags.waitlist && req.body.type !== 'Chaperone') {
                var message = "The conference has reached capacity, sorry!";
                res.redirect('/account?message=' + message);
            } else {
                Member.create({
                    name             : req.body.name,
                    _group           : req.session.group._id,
                    type             : req.body.type,
                    gender           : req.body.gender,
                    birthDate        : {
                        day          : req.body.birthDay,
                        month        : req.body.birthMonth,
                        year         : req.body.birthYear
                    },
                    phone            : req.body.phone,
                    email            : req.body.email,
                    emergencyContact : {
                        name         : req.body.emergName,
                        relation     : req.body.emergRelation,
                        phone        : req.body.emergPhone
                    },
                    emergencyInfo    : {
                        medicalNum   : req.body.emergMedicalNum,
                        allergies    : req.body.emergAllergies.split(',').sort(),
                        conditions   : req.body.emergConditions.split(',').sort()
                    }
                }, function (err, member) {
                    if (!err && member) {
                        // If we're now full... Flag the waitlist.
                        if (data.flags.waitlist !== true) {
                            Member.count({type: {$ne: 'Chaperone'}}, function (err, count) {
                                if (count + 1 >= Number(process.env.MAX_YOUTH)) {
                                    require('../schema/Flag').update({ key: 'waitlist' },
                                    { key: 'waitlist', value: true }, {upsert: true})
                                    .exec(function () {
                                        data.flags.waitlist = true;
                                        console.log("Setting waitlist variable to `true`");
                                    });
                                }
                            });
                        }
                        // Refresh the group, make sure that steps are unset.
                        Group.findById(member._group).exec(function (err, group) {
                            if (!err && group) {
                                group.getCost(function (err, cost) {
                                    group._state.steps.members = false;
                                    group._state.steps.payments = false;
                                    group._state.balance.cost = cost;
                                    group.save(function (err, group) {
                                        req.session.group = group;
                                        res.redirect('/account#members');
                                    });
                                });
                            } else {
                                console.error(err);
                                var message = "Couldn't refresh your group details. You might need to relog!";
                                res.redirect('/account?message=' + message);
                            }
                        });
                    } else {
                        // TODO Better error messages.
                        console.error(err);
                        var message = "There was an error in the validation and saving of the member. Are they old enough? Did you fill out at least their name and delegate type?";
                        res.redirect('/account?message=' + message);
                    }
                });
            }
        })
        .get(util.auth, function (req, res) {
            if (data.flags.waitlist) {
                req.session.message = "The conference has reached capacity! You will only be able to add chaperones and edit members.";
            }
            // Empty form.
            res.render('member', {
                session: req.session
            });
        });
    router.route('/member/:id')
        .get(util.inGroup, function (req, res) {
            Member.findById(req.params.id).exec(function (err, member) {
                if (!err && member) {
                    // Populated form.
                    res.render('member', {
                        member  : member,
                        session : req.session
                    });
                } else {
                    res.send('Sorry, there was an error finding your member. Try again?');
                    console.error(err);
                }
            });
        })
        .put(util.inGroup, function (req, res) {
            Member.findById(req.body.id).exec(function (err, member) {
                if (!err && member) {
                    member.name                      = req.body.name;
                    // **Don't re-assign group**
                    // member._group                    = req.session.group._id;
                    member.type                      = req.body.type;
                    member.gender                    = req.body.gender;
                    member.birthDate.day             = req.body.birthDay;
                    member.birthDate.month           = req.body.birthMonth;
                    member.birthDate.year            = req.body.birthYear;
                    member.phone                     = req.body.phone;
                    member.email                     = req.body.email;
                    member.emergencyContact.name     = req.body.emergName;
                    member.emergencyContact.relation = req.body.emergRelation;
                    member.emergencyContact.phone    = req.body.emergPhone;
                    member.emergencyInfo.medicalNum  = req.body.emergMedicalNum;
                    member.emergencyInfo.allergies   = req.body.emergAllergies.split(',').sort();
                    member.emergencyInfo.conditions  = req.body.emergConditions.split(',').sort();
                    member._state.youthInCare        = (req.body.youthInCare == "Yes");
                    member._state.youthInCareSupport = (req.body.youthInCareSupport == "Yes");
                    if (req.session.isAdmin && req.body.ticketType) {
                        member._state.ticketType     = req.body.ticketType;
                    }
                    member.save(function (err, member) {
                        if (!err && member) {
                            Group.findByIdAndUpdate(member._group, {
                                $set: {
                                    '_state.steps.members': false
                                }
                            }).exec(function (err, group) {
                                req.session.group = group;
                                res.redirect('/account');
                            });
                        } else {
                            console.error(err);
                            var message = "There was an error in the validation and saving of the member. Are they old enough? Did you fill out at least their name and delegate type?";
                            res.redirect('/account?message=' + message);
                        }
                    });
                } else {
                    res.send('Sorry, there was an error finding that member. Try again?');
                    console.error(err);
                }
            });
        })
        .delete(util.inGroup, function (req, res) {
            Member.findById(req.params.id).exec(function (err, member) {
                if (!err && member) {
                    member.remove(function (err) {
                        if (!err) {
                            Group.findById(member._group).exec(function (err, group) {
                                if (!err && group) {
                                    group.getCost(function (err, cost) {
                                        group._state.steps.members = false;
                                        group._state.steps.payments = false;
                                        group._state.balance.cost = cost;
                                        group.save(function (err, group) {
                                            req.session.group = group;
                                            res.redirect('/account?removals#members');
                                        });
                                    });
                                } else {
                                    res.send('Sorry, there was an error removing that member. Try again?');
                                    console.error(err);
                                }
                            });
                        } else {
                            res.send('Sorry, there was an error removing that member. Try again?');
                            console.error(err);
                        }
                    });
                } else {
                    res.send('Sorry, there was an error finding that member. Try again?');
                    console.error(err);
                }
            });
        });

    router.get('/member/:id/workshops', util.auth, function (req, res) {
        Member.findById(req.params.id)
            .populate("_workshops").exec(function (err, member) {
                Workshop.find({_id: { $in: _.pluck(member._workshops, '_workshop') } })
                    .exec(function (err, workshops) {
                        if (!err && member) {
                            // Data prep.
                            var workshopMap = _.indexBy(workshops, '_id');
                            res.render('membersWorkshops', {
                                session: req.session,
                                member: member,
                                workshops: workshopMap,
                                moment: moment
                            });
                        } else {
                            var message = "There was an error getting that member and their workshops.";
                            res.redirect('/account?message=' + message);
                        }
                });
            });
    });

    router.get('/member/add/:id/:session', util.inGroup, function (req, res) {
        Member.findById(req.params.id).exec(function (err, member) {
            if (!err && member) {
                member.addWorkshop(req.params.session, function (err, member) {
                    var message;
                    if (!err) {
                        message = member.name + " has been added to session.";
                        res.json({success: true, message: message});
                    } else {
                        // The error here is a bit odd... It's an object.
                        // err.success = false; // Can't do this!
                        res.json({success: false, message: err.message});
                        console.error(err);
                    }
                });
            } else {
                res.json({success: false, message:'Sorry, there was an error finding that member. Try again?'});
                console.error(err);
            }
        });
    });

    router.get('/member/del/:id/:session', util.inGroup, function (req, res) {
        Member.findById(req.params.id).exec(function (err, member) {
            if (!err && member) {
                member.removeWorkshop(req.params.session, function (err, member) {
                    var message;
                    if (!err) {
                        message = member.name + " has been removed from session.";
                        res.json({success: true, message: message});
                    } else {
                        message = "Couldn't remove that member from the workshop... Try again?";
                        res.json({success: false, message: message});
                        console.error(err);
                    }
                });
            } else {
                res.json({success: false, message:'Sorry, there was an error finding that member. Try again?'});
                console.error(err);
            }
        });
    });

    var runningStats = {
        count     : 0,
        lastCheck : new Date('Jan 1, 1970'),
        interval  : 1000*60*2 // Max once per 2 minutes.
    };
    router.get('/members/count', function (req, res) {
        if (new Date() - runningStats.lastCheck > runningStats.interval) {
            Member.count({type: {$ne: 'Chaperone'}}, function (err, count) {
                if (!err && count) {
                    runningStats.count = count;
                }
                res.json({count: runningStats.count, limit: Number(process.env.MAX_YOUTH) });
            });
        } else {
            res.json({count: runningStats.count, limit: Number(process.env.MAX_YOUTH) });
        }
    });

    return router;
};
