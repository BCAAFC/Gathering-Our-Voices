'use strict';

var async = require('async'),
    _     = require('lodash');

module.exports = function(data) {
    var router = require('express').Router(),
        Group  = require('../schema/Group'),
        Member = require('../schema/Member'),
        News   = require('../schema/News'),
        Faq    = require('../schema/Faq'),
        util   = require('./util');

    router.get('/admin', util.admin, function (req, res) {
        res.redirect('/admin/groups');
    });

    router.get('/admin/:type', util.admin, function (req, res) {
        var data, keys, selected = req.params.type;
        if (selected == 'groups') {
            Group.find({'_state.waitlist':  0}).select('-hash -password').exec(function (err, groups) {
                if (!err) {
                    data = groups.map(function (v) {
                        v.actions = ' ';
                        if (v._notes === '' || v._notes === undefined) { v._notes = false; }
                        else { v._notes = true; }
                        return v;
                    });
                    keys = [
                        { title: 'Steps', data: '_state.steps' },
                        { title: 'id', data: '_id' },
                        { title: 'Name', data: 'name' },
                        { title: 'Affiliation', data: 'affiliation' },
                        { title: 'Members', data: '_members' },
                        { title: 'Address', data: 'address' },
                        { title: 'City', data: 'city'},
                        { title: 'Province', data: 'province'},
                        { title: 'Postal Code', data: 'postalCode'},
                        { title: 'Fax', data: 'fax'},
                        { title: 'Phone', data: 'phone'},
                        { title: 'Region', data: 'region'},
                        { title: 'Type', data: 'affiliationType'},
                        { title: 'Reg Date', data: 'registrationDate'},
                        { title: 'Email', data: 'email' },
                        { title: 'Cost', data: '_state.balance.cost'},
                        { title: 'Paid', data: '_state.balance.paid' },
                        { title: 'Tags', data: '_state.tags' },
                        {
                            "orderable":      false,
                            "data":           null,
                            "defaultContent": ''
                        }
                    ];
                    res.render('admin', {
                        title    : 'Administration',
                        session  : req.session,
                        data     : data,
                        keys     : keys,
                        selected : selected
                    });
                } else {
                    res.send('There was an error.');
                    console.error(err);
                }
            });
        } else if (selected == 'waitlist') {
                Group.find({'_state.waitlist': {'$ne': 0}}).select('-hash -password').exec(function (err, groups) {
                    if (!err) {
                        data = groups.map(function (v) { v.actions = ' '; return v; });
                        keys = [
                            { title: 'Steps', data: '_state.steps' },
                            { title: 'id', data: '_id' },
                            { title: 'Name', data: 'name' },
                            { title: 'Affiliation', data: 'affiliation' },
                            { title: 'Members', data: '_members' },
                            { title: 'Address', data: 'address' },
                            { title: 'City', data: 'city'},
                            { title: 'Province', data: 'province'},
                            { title: 'Postal Code', data: 'postalCode'},
                            { title: 'Fax', data: 'fax'},
                            { title: 'Phone', data: 'phone'},
                            { title: 'Region', data: 'region'},
                            { title: 'Type', data: 'affiliationType'},
                            { title: 'Reg Date', data: 'registrationDate'},
                            { title: 'Email', data: 'email' },
                            { title: 'Cost', data: '_state.balance.cost'},
                            { title: 'Paid', data: '_state.balance.paid' },
                            { title: 'Requested', data: '_state.waitlist' },
                            { title: 'Tags', data: '_state.tags' },
                            {
                                "orderable":      false,
                                "data":           null,
                                "defaultContent": ''
                            }
                        ];
                        res.render('admin', {
                            title    : 'Administration',
                            session  : req.session,
                            data     : data,
                            keys     : keys,
                            selected : selected
                        });
                    } else {
                        res.send('There was an error.');
                        console.error(err);
                    }
                    });
        } else if (selected == 'members') {
            Member.find().exec(function (err, members) {
                if (!err) {
                    members.map(function (v) {
                        // So some simple mutation, so clients don't need to.
                        v.birthDate = v.birthDate.day + ' ' + v.birthDate.month + ' ' + v.birthDate.year;
                        v.emergencyContact = v.emergencyContact.name + ' ' + v.emergencyContact.phone;
                        return v;
                    });
                    data = members;
                    keys = [
                        { title: 'id', data: '_id' },
                        { title: 'Group id', data: '_group' },
                        { title: 'Name', data: 'name' },
                        { title: 'Type', data: 'type' },
                        { title: 'Gender', data: 'gender' },
                        { title: 'B.Day', data: 'birthDate' },
                        { title: 'Phone', data: 'phone' },
                        { title: 'Email', data: 'email' },
                        { title: 'Contact', data: 'emergencyContact' },
                        { title: 'Medical Num', data: 'emergencyInfo.medicalNum' },
                        { title: 'Allergies', data: 'emergencyInfo.allergies' },
                        { title: 'Conditions', data: 'emergencyInfo.conditions' },
                        { title: 'Complete', data: '_state.complete' },
                        { title: 'Ticket', data: '_state.ticketType' },
                        { title: 'Reg. Date', data: '_state.registrationDate' }
                    ];
                    res.render('admin', {
                        title    : 'Administration',
                        session  : req.session,
                        data     : data,
                        keys     : keys,
                        selected : selected
                    });
                } else {
                    res.send('There was an error.');
                    console.error(err);
                }
            });
        } else if (selected == 'facilitators') {
            var Facilitator = require('../schema/Facilitator');
            Facilitator.find({}).sort('submissionDate').exec(function (err, facilitators) {
                if (!err) {
                    keys = [
                        {
                            "orderable":      false,
                            "data":           null,
                            "defaultContent": ''
                        },
                        { title: 'Submission Date', data: 'submissionDate' },
                        { title: 'Facilitator Name', data: 'name' },
                        { title: 'Affiliation', data: 'affiliation' },
                        { title: 'Phone', data: 'phone' },
                        { title: 'Fax', data: 'fax' },
                        { title: 'Email', data: 'email' },
                        { title: 'Mailing', data: 'mailing' },
                        { title: 'Workshop Name', data: 'workshop' },
                        { title: 'Length', data: 'length' },
                        { title: 'Category', data: 'category' },
                        { title: 'Audience', data: 'audience' },
                        { title: 'Type', data: 'type' },
                        { title: 'Eq - Flipchart', data: 'equipment.flipchart' },
                        { title: 'Eq - Projector', data: 'equipment.projector' },
                        { title: 'Eq - Screen', data: 'equipment.screen' },
                        { title: 'Eq - Player', data: 'equipment.player' },
                        { title: 'Room', data: 'roomRequirement' },
                        { title: 'Capacity', data: 'capacity' },
                        { title: 'Comp - Meal', data: 'compensation.meal' },
                        { title: 'Comp - Accommodation', data: 'compensation.accommodation' },
                        { title: 'Comp - Travel', data: 'compensation.travel' },
                        { title: 'Comp - Honorarium', data: 'compensation.honorarium' },
                        { title: 'Category Reason', data: 'categoryReason' },
                        { title: 'Description', data: 'description' },
                        { title: 'Summary', data: 'summary' },
                        { title: 'Interaction Level', data: 'interactionLevel' },
                        { title: 'Biography', data: 'biography' },
                        { title: 'Notes', data: 'notes' }
                    ];
                    res.render('admin', {
                        title    : 'Administration',
                        session  : req.session,
                        data     : facilitators,
                        keys     : keys,
                        selected : selected
                    });
                } else {
                    res.send('There was an error.');
                    console.error(err);
                }
            });
        }
    });

    router.get('/manage/:id', util.admin, function (req, res) {
        Group.findById(req.params.id).exec(function (err, group) {
            if (!err && group) {
                // Maintain administrator status.
                req.session.group = group;
                res.redirect('/account');
            } else {
                res.send('There was an error, or there is no such group.');
                console.error(err);
            }
        });
    });

    router.route('/notes/:id')
        .get(util.admin, function (req, res) {
            Group.findById(req.params.id).exec(function (err, group) {
                if (!err && group) {
                    res.render('notes', {
                        title   : 'Group Notes',
                        session : req.session,
                        group   : group
                    });
                } else {
                    res.send('There was an error, or there is no such group.');
                    console.error(err);
                }
            });
        }).put(util.admin, function (req, res) {
            Group.findById(req.params.id).exec(function (err, group) {
                if (!err && group) {
                    group._notes      = req.body.notes;
                    group._state.tags = req.body.tags.split(',').sort();
                    group.save(function (err) {
                        if (!err) {
                            res.redirect('/notes/' + group._id);
                        } else {
                            res.send('There was an error saving the group.');
                            console.error(err);
                        }
                    });
                } else {
                    res.send('There was an error, or there is no such group.');
                    console.error(err);
                }
            });
        });

    router.get('/approve/:id', util.admin, function (req, res) {
        Group.findById(req.params.id).exec(function (err, group) {
            if (!err && group) {
                addPlaceholders(group._state.waitlist, group._id, function (err) {
                    if (err) {
                        res.send("Something went rather horribly wrong. Please let me know.");
                        console.error(err);
                    } else {
                        // Refresh data.
                        Group.findById(req.params.id).exec(function (err, group) {
                            group._state.waitlist = 0;
                            group.getCost(function (err, cost) {
                                group._state.balance.cost = cost;
                                group.save(function (err) {
                                    if (err) {
                                        res.send("Something went rather horribly wrong. Please let me know.");
                                        console.error(err);
                                    } else {
                                        res.redirect('/manage/' + req.params.id);
                                    }
                                });
                            });
                        });
                    }
                });
            } else {
                res.send('There was an error, or there is no such group.');
                console.error(err);
            }
        });
    });

    router.post('/waitlist', util.admin, function (req, res) {
        if (!req.body.requested) { return res.send('Need more info...'); }
        else if (req.body.requested <= 0) { return res.send('Need more members...'); }

        Group.findByIdAndUpdate(req.session.group._id, {
            '_state.waitlist': req.body.requested,
            'registrationDate': new Date()
        }).exec(function (err, group) {
            if (err) {
                console.error(err);
                return res.send("There was an odd error... Ask me to check the logs.");
            } else {
                req.session.group = group;
                res.redirect('/account#members');
            }
        });
    });

    // Uses `:id` because it's an Admin only thing.
    router.post('/placeholders/:id', util.admin, function (req, res) {
        if (!req.body.amount) { return res.send('Need more info...'); }
        else if (req.body.amount <= 0) { return res.send('Need more members...'); }

        Group.findById(req.params.id).exec(function (err, group) {
            if (!err && group) {
                addPlaceholders(req.body.amount, group._id, function (err) {
                    if (err) {
                        res.send("Something went rather horribly wrong. Please let me know.");
                        console.error(err);
                    } else {
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
                        // Refresh data.
                        Group.findById(req.params.id).exec(function (err, group) {
                            group.getCost(function (err, cost) {
                                group._state.balance.cost = cost;
                                group.save(function (err) {
                                    req.session.group = group;
                                    if (err) {
                                        res.send("Something went rather horribly wrong. Please let me know.");
                                        console.error(err);
                                    } else {
                                        res.redirect('/account#members');
                                    }
                                });
                            });
                        });
                    }
                });
            } else {
                res.send('There was an error, or there is no such group.');
                console.error(err);
            }
        });
    });

    function addPlaceholders (number, group, next) {
        function recurser (left, group) {
            if (left <= 0) { return next(null); }
            Member.create({
                name             : "Placeholder",
                _group           : group,
                type             : "Youth"
            }, function (err) {
                if (err) {
                    next(err);
                } else {
                    recurser(left-1, group);
                }
            });
        }
        recurser(number, group);
    }

    router.get('/statistics', util.admin, function (req, res) {
        async.auto({
            groups  : groups,
            members : members
        }, function complete(err, data) {
            res.render('statistics', {
                title                   : 'Statistics',
                session                 : req.session,
                types                   : data.members.types,
                ages                    : data.members.ages,
                regions                 : data.members.regions,
                totals                  : data.members.totals,
                dates                   : data.members.dates,
                youthInCareCount        : data.groups.youthInCare,
                youthInCareSupportCount : data.groups.youthInCareSupport,
                affiliationType         : data.groups.affiliationType
            });
        });
        function groups(callback) {
            Group.find({'_state.waitlist': 0}).select('youthInCare youthInCareSupport region affiliationType')
                .exec(function (err, groups) {
                    // console.log(groups);
                    var result = _.reduce(groups, function (sum, group) {
                        // Need Youth In Care Feat Counts
                        sum.youthInCare += group.youthInCare;
                        sum.youthInCareSupport += group.youthInCareSupport;
                        sum.affiliationType[group.affiliationType] += 1;
                        return sum;
                    }, {youthInCare: 0, youthInCareSupport: 0, affiliationType: {
                        "Friendship Centre": 0,
                        "Off-reserve": 0,
                        "On-reserve": 0,
                        "Other": 0
                    }});
                    // console.log(result);
                    callback(null, result);
                });
        }
        function members(callback) {
            var startDate = new Date('Sept 01 2014'),
                stopDate = new Date('Mar 21 2015');
            Member.find({}).populate('_group').exec(function (err, members) {
                // Cleverness below!
                var ages = _.range(14, 24+1).concat(['over', '']),
                        regions = ['North', 'Fraser', 'Interior', 'Vancouver Coastal',
                                             'Vancouver Island', 'Out of Province'],
                        types = ['Youth', 'Young Adult', 'Young Chaperone', 'Chaperone', ''],
                        dates = (function () {
                            var oneDay = 24*60*60*1000, // hours*minutes*seconds*milliseconds
                                numDays = Math.round(Math.abs((startDate.getTime() - stopDate.getTime())/(oneDay)));
                            return Array.apply(null, new Array(numDays)).map(function (v) { return {
                                'Youth': 0,
                                'Young Adult': 0,
                                'Chaperone': 0,
                                'Young Chaperone': 0
                            }; });
                        })();
                function buildEmpties(array) {
                    return _(array).map(function (val) {
                        return [val, {Male: 0, Female: 0, Other: 0, '': 0}];
                    }).zipObject().value();
                }
                var summation = {
                    types   : buildEmpties(types),
                    regions : buildEmpties(regions),
                    ages    : buildEmpties(ages),
                    dates   : dates,
                    totals  : {Male: 0, Female: 0, Other: 0, '': 0}
                };
                var result = _.reduce(members, function (sum, val) {
                    // Type
                    summation.types[val.type][val.gender] += 1;
                    // Age
                    if (val.birthDate.year) {
                        var the_age = (val.birthDate.year - 2015)*(-1);
                        if (the_age <= 24) {
                            summation.ages[the_age][val.gender] += 1;
                        } else {
                            summation.ages.over[val.gender] +=1;
                        }
                    } else {
                        summation.ages[''][val.gender] += 1;
                    }
                    // Region
                    summation.regions[val._group.region][val.gender] += 1;
                    // Totals
                    summation.totals[val.gender] += 1;
                    // Dates
                    var normalized = Date.parse(val._state.registrationDate) - startDate;
                    normalized = normalized / (24*60*60*1000); // One day
                    normalized = Math.floor(normalized);
                    summation.dates[normalized][val.type] += 1;
                    // Must return summation.
                    return summation;
                }, summation);
                // console.log(result.dates);
                callback(null, result);
            });
        }
    });

    router.get('/emails', util.admin, function (req, res) {
        async.auto({
            groups  : function (next) { Group.find({}).select('name email _state').exec(next); },
            members : function (next) { Member.find({email: {$ne: ""}}).select('name email').exec(next); }
        }, function complete(err, data) {
            if (!err) {
                var groups = _(data.groups).uniq('email').groupBy(function (x) {
                    if (x._state.waitlist == 0) {
                        return 'normal';
                    } else { return 'waitlisted' };
                }).value();
                res.render('emails', {
                    title   : 'Email listing',
                    session : req.session,
                    groups  : groups.normal,
                    waitlisted: groups.waitlisted,
                    members : _.uniq(data.members, 'email'),
                    data    : JSON.stringify(data, null, 2)
                });
            } else {
                res.send('There was an error fetching this.');
                console.error(err);
            }
        });
    });

    /** News */
    router.post('/news', util.admin, function (req, res) {
        var fs = require('fs'),
            imageMagick = require('gm').subClass({imageMagick: true});
        // Prep image
        imageMagick(req.files.image.path).resize(470).toBuffer('jpeg', function (err, buffer) {
            // Create news
            News.create({
                title   : req.body.title,
                content : req.body.content,
                date    : new Date(req.body.date),
                author  : req.body.author,
                image   : buffer.toString('base64')
            }, function (err, news) {
                if (!err) {
                    res.redirect('/news');
                } else {
                    res.send('There was an error:\n' + err);
                    console.error(err);
                }
            });
        });
    });

    router.get('/news/del/:id', util.admin, function (req, res) {
        News.remove({_id: req.params.id}).exec(function (err) {
            if (!err) {
                res.redirect('/news');
            } else {
                res.send('There was an error:\n' + err);
                console.error(err);
            }
        });
    });

    /** FAQs */
    router.post('/faq/section', util.admin, function (req, res) {
        var Faq = require('../schema/Faq');
        Faq.create({
            title   : req.body.title,
            prelude : req.body.prelude,
            items   : []
        }, function (err, section) {
            if (!err) {
                res.redirect('/faq');
            } else {
                res.send('There was an error:\n' + err);
                console.error(err);
            }
        });
    });

    router.get('/faq/del/:id', util.admin, function (req, res) {
        // Remove a section.
        Faq.remove({_id: req.params.id}).exec(function (err) {
            if (!err) {
                res.redirect('/faq');
            } else {
                res.send('There was an error:\n' + err);
                console.error(err);
            }
        });
    });

    router.get('/faq/del/:section/:id', util.admin, function (req, res) {
        var ObjectId = require('mongoose').Schema.ObjectId;
        // Remove a section.
        Faq.findByIdAndUpdate(req.params.section, {
            $pull: {
                items: {
                    _id: req.params.id
                }
            }
        }).exec(function (err) {
            if (!err) {
                res.redirect('/faq');
            } else {
                res.send('There was an error:\n' + err);
                console.error(err);
            }
        });
    });

    router.post('/faq/question', util.admin, function (req, res) {
        // Place an item in.
        Faq.findById(req.body.section).exec(function (err, faq) {
            // Non-atomic so the middleware fires.
            faq.items.push({
                question : req.body.question,
                answer   : req.body.answer
            });
            faq.save(function (err) {
                if (!err) {
                    res.redirect('/faq');
                } else {
                    var message = "Couldn't do it!";
                    res.redirect('/faq?message=' + message);
                }
            });
        });
    });

    return router;
};
