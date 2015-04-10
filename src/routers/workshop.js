'use strict';

var async  = require('async'),
    _      = require('lodash'),
    moment = require('moment');

module.exports = function(data) {
        var router   = require('express').Router(),
            Group    = require('../schema/Group'),
            Workshop = require('../schema/Workshop'),
            Member   = require('../schema/Member'),
            Session  = require('../schema/Session'),
            util     = require('./util');

        router.get('/workshops', function (req, res) {
            // Build output.
            Workshop.find({}).sort('name').select("-description").populate('_sessions', 'start end venue capacity _registered').lean().exec(function (err, workshops) {
                if (!err) {
                    // We only care about how many there are,
                    // and we don't really want to send this otherwise.
                    workshops = workshops.map(function (workshop) {
                        workshop._sessions = workshop._sessions.map(function (session) {
                            session.registered = session._registered.length;
                            session._registered = null; // Don't send it.
                            delete session._registered;
                            // Dates
                            session.start = moment(session.start).format('Do h:mm A');
                            session.end = moment(session.end).format('h:mm A'); // Only show hour
                            return session;
                        });
                        return workshop;
                    });
                    res.render('workshops', {
                        title     : 'Workshops',
                        session   : req.session,
                        data      : workshops || [],
                        keys      : [
                            {
                                "orderable":      false,
                                "data":           null,
                                "defaultContent": ''
                            },
                            { title: 'Name', data: 'name' },
                            { title: 'Host', data: 'host' },
                            // { title: 'Description', data: 'description' },
                            { title: 'Allows', data: 'allows' },
                            { title: 'Category', data: 'category' },
                            { title: 'Tags', data: 'tags' },
                            { title: 'Sessions', data: '_sessions' },
                        ]
                    });
                } else {
                    res.send('There was a strange error. Please go back and try again.');
                    console.error(err);
                }
            });
        });

        router.get('/workshop/create', util.admin, function (req, res) {
            res.render('workshopModify', {
                title: "Create a workshop",
                session: req.session,
                lastForm : req.session.lastForm || {}
            });
        });
        router.get('/workshop/modify/:id', util.admin, function (req, res) {
            Workshop.findById(req.params.id).exec(function (err, workshop) {
                if (!err && workshop) {
                    req.lastForm = workshop;
                    if (workshop.allows.indexOf("Youth") != -1) { req.lastForm['allows-youth'] = 'on'; }
                    if (workshop.allows.indexOf("Young Adult") != -1) { req.lastForm['allows-youngAdult'] = 'on'; }
                    if (workshop.allows.indexOf("Young Chaperone") != -1) { req.lastForm['allows-youngChaperone'] = 'on'; }
                    if (workshop.allows.indexOf("Chaperone") != -1) { req.lastForm['allows-chaperone'] = 'on'; }
                    res.render('workshopModify', {
                        title: "Create a workshop",
                        session: req.session,
                        lastForm : req.lastForm || {}
                    });
                } else {
                    res.send('There was an error, try again?');
                    console.error(err);
                }
            });
        });

        router.post('/workshop/:id/session', util.admin, function (req, res) {
            Session.create({
                start: req.body.start,
                end: req.body.end,
                room: req.body.room,
                venue: req.body.venue,
                capacity: req.body.capacity,
                _workshop: req.params.id,
                _registered: []
            }, function (err, session) {
                if (!err) {
                    Workshop.findById(session._workshop).exec(function (err, workshop) {
                        if (!err) {
                            workshop._sessions.push(session._id);
                            workshop.save(function (err) {
                                if (!err) {
                                    res.redirect('/workshop/' + req.params.id);
                                } else {
                                    res.send('There was an error, try again?');
                                    console.error(err);
                                }
                            });
                        } else {
                            res.send('There was an error, try again?');
                            console.error(err);
                        }
                    });
                } else {
                    res.send('There was an error, try again?');
                    console.error(err);
                }
            });
        });

        router.get('/session/delete/:session', util.admin, function (req, res) {
            // GET request so we don't need to send a form.
            Session.findById(req.params.session).exec(function (err, session) {
                if (!err && session) {
                    session.remove(function (err) {
                        if (!err) {
                            res.redirect('/workshop/' + session._workshop);
                        } else {
                            console.error(err);
                            res.redirect('/workshop/?message=' + err);
                        }
                    });
                } else {
                    console.error('There was an error here.');
                    res.send('That workshop could not be found. This is a strange error. Please report it.');
                }
            });
        });

        router.post('/session/update/:session', util.admin, function (req, res) {
            Session.findByIdAndUpdate(req.params.session, {
                capacity: req.body.capacity,
                venue: req.body.venue,
                room: req.body.room
            }).exec(function (err, session) {
                if (!err && session) {
                    res.redirect('/workshop/' + session._workshop);
                } else {
                    console.error(err);
                    res.redirect('/workshop/?message=' + err);
                }
            });
        });

        router.route('/workshop/:id')
            .get(function (req, res) {
                async.auto({
                    workshop: function (next) {
                        return Workshop.findById(req.params.id).populate({
                            path: '_sessions',
                            options: {
                                sort: {
                                    start: 1
                                }
                            }
                        }).exec(function (err, result) {
                            if (!err && result === null) {
                                next(new Error('No workshop found'));
                            } else {
                                next(err, result);
                            }
                        });
                    },
                    members: function (next) {
                        if (req.session && req.session.group) {
                            return Member.find({ _group: req.session.group._id }).sort('name').exec(next);
                        } else {
                            return next(null, []);
                        }
                    },
                    admin: ['workshop', function (next, data) {
                        if (req.session && req.session.isAdmin) {
                            var sessions = data.workshop._sessions.map(function (v) {
                                return v._id;
                            });
                            return Member.find({ _workshops: { $in: sessions }}).sort('name').exec(next);
                        } else {
                            return next(null, {});
                        }
                    }]
                }, function complete(err, data) {
                    if (!err && data.workshop) {
                        res.render('workshop', {
                            title    : "Workshop Details",
                            session  : req.session,
                            workshop : data.workshop,
                            members  : data.members,
                            admin    : data.admin,
                            moment   : moment
                        });
                    } else {
                        res.send('There was an error or we weren\'t able to find that workshop. Try again?');
                        console.error(err);
                    }
                });
            });


        /**
         * Transforms a choice into an array of types that can sign up.
         */
        function allowsTransformer(val) {
            var allowed = [];
            if (val['allows-youth']) { allowed.push("Youth"); }
            if (val['allows-youngAdult']) { allowed.push("Young Adult"); }
            if (val['allows-youngChaperone']) { allowed.push("Young Chaperone"); }
            if (val['allows-chaperone']) { allowed.push("Chaperone"); }
            return allowed;
        }

        router.route('/workshop')
            .get(util.admin, function (req, res) {
                if (req.query.id) {
                    Workshop.findById(req.query.id).exec(function (err, workshop) {
                        if (!err && workshop) {
                            res.render('templates/workshopForm', {
                                session  : req.session,
                                workshop : workshop
                            });
                        } else {
                            res.send('There was an error getting that workshop. Try again?');
                            console.error(err);
                        }
                    });
                }
            })
            .post(util.admin, function (req, res) {
                Workshop.create({
                    name        : req.body.name,
                    host        : req.body.host,
                    description : req.body.description,
                    category    : req.body.category,
                    tags        : req.body.tags.split(','),
                    allows      : allowsTransformer(req.body)
                }, function (err, workshop) {
                    if (err) {
                        res.redirect('/workshops?message=' + JSON.stringify(err));
                    } else {
                        res.redirect('/workshop/' + workshop._id);
                    }
                });
            })
            .put(util.admin, function (req, res) {
                Workshop.findById(req.body._id).exec(function (err, workshop) {
                    if (!err && workshop) {
                        workshop.name        = req.body.name;
                        workshop.host        = req.body.host;
                        workshop.description = req.body.description;
                        workshop.category    = req.body.category;
                        workshop.tags        = req.body.tags.split(',');
                        workshop.allows      = allowsTransformer(req.body);
                        workshop.save(function (err) {
                            if (!err) {
                                res.redirect('/workshops');
                            } else {
                                res.send('There was an error doing that, try again?');
                                console.error(err);
                            }
                        });
                    } else {
                        res.send('There was an error making that change. Try again?');
                        console.error(err);
                    }
                });
            });

        // router.delete('/workshop/delete/:id', util.admin, function (req, res) {
        //     Workshop.findById(req.params.id).exec(function (err, workshop) {
        //         if (!err && workshop) {
        //             workshop.remove(function (err) {
        //                 if (!err) {
        //                     res.redirect('/workshops?message=Workshop deleted!');
        //                 } else {
        //                     res.redirect('/workshops?message=Workshop not deleted!');
        //                     console.error(err);
        //                 }
        //             });
        //         } else {
        //             res.redirect('/workshops?message=Could not find workshop!');
        //             console.error(err);
        //         }
        //     });
        // });

        return router;
};
