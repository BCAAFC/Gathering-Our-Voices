"use strict";

var middleware = require("../middleware"),
    communication = require("../communication"),
    alert = require("../alert");

var csv_stringify = require("csv-stringify"),
    moment = require("moment"),
    Promise = require("bluebird");

function scaffoldDay(day, req, current) {
    var  result = {};

    result.day = day;
    result.morning = {};
    result.morning.available = req.body[day + '-morning-available']? true : false;
    if (req.session.isAdmin) {
        result.morning.scheduled = req.body[day + '-morning-scheduled'];
    } else if (current && current.morning) {
        result.morning.scheduled = current.morning.scheduled;
    } else {
        result.morning.scheduled = null;
    }

    result.afternoon = {};
    result.afternoon.available = req.body[day + '-afternoon-available']? true : false;
    if (req.session.isAdmin) {
        result.afternoon.scheduled = req.body[day + '-afternoon-scheduled'];
    } else if (current && current.afternoon) {
        result.afternoon.scheduled = current.afternoon.scheduled;
    } else {
        result.afternoon.scheduled = null;
    }

    result.evening = {};
    result.evening.available = req.body[day + '-evening-available']? true : false;
    if (req.session.isAdmin) {
        result.evening.scheduled = req.body[day + '-evening-scheduled'];
    } else if (current && current.evening) {
        result.evening.scheduled = current.evening.scheduled;
    } else {
        result.evening.scheduled = null;
    }

    return result;
}

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Volunteer, },
            ],
        }).then(function (account) {
            // Verify
            if (!account) {
                throw new Error("No account found.");
            }

            var volunteer = {};

            var schedule = [
                scaffoldDay("Sunday, March 20", req),
                scaffoldDay("Monday, March 21", req),
                scaffoldDay("Tuesday, March 22", req),
                scaffoldDay("Wednesday, March 23", req),
                scaffoldDay("Thursday, March 24", req),
            ];
            volunteer.schedule = schedule;

            if (req.body.applied === "on") {
                volunteer.applied = true;
            } else {
                volunteer.applied = false;
            }

            volunteer.emergencyName = req.body.emergencyName;
            volunteer.emergencyPhone = req.body.emergencyPhone;
            volunteer.tshirt = req.body.tshirt;
            volunteer.previousExperience = req.body.previousExperience;
            volunteer.interests = req.body.interests;
            volunteer.notes = req.body.notes;

            console.log(volunteer);
            return account.createVolunteer(volunteer);
        }).then(function (volunteer) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Volunteer application created!");
                    res.redirect('/account/');
                },
                'default': function () { res.status(200).json(volunteer); },
            });
        }).catch(function (error) {
            console.log(error);
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/:id")
    .put(middleware.auth, function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Volunteer, },
            ],
        }).then(function (account) {
            // Verify
            if (!account) {
                throw new Error("No account found.");
            } else if (account.Volunteer.id === req.params.id) {
                throw new Error("Volunteer is not part of that account.");
            }

            var volunteer = account.Volunteer;

            if (req.body.applied !== undefined) {
                volunteer.applied = true;
            } else {
                volunteer.applied = false;
            }

            // Approved/FollowUp is done seperately.

            volunteer.emergencyName = req.body.emergencyName;
            volunteer.emergencyPhone = req.body.emergencyPhone;
            volunteer.tshirt = req.body.tshirt;
            volunteer.interests = req.body.interests;
            volunteer.previousExperience = req.body.previousExperience;
            volunteer.notes = req.body.notes;

            volunteer.schedule = volunteer.schedule.map(function (v) {
                return scaffoldDay(v.day, req, v);
            });

            return volunteer.save();
        }).then(function (volunteer) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Volunteer application updated!");
                    res.redirect('/account/');
                },
                'default': function () { res.status(200).json(volunteer); },
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
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (volunteer.tags.indexOf(req.body.add) !== -1) {
                throw new Error("Tag already exists.");
            } else {
                volunteer.tags.push(req.body.add);
                return volunteer.save({fields: ['tags']});
            }
        }).then(function (volunteer) {
            res.status(200).json(volunteer.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    })
    .delete(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Member not found."); }
            var idx = volunteer.tags.indexOf(req.body.remove);
            if (idx !== -1) {
                volunteer.tags.splice(idx, 1);
                return volunteer.save({fields: ['tags']});
            } else {
                throw new Error("Tag does not exist.");
            }
        }).then(function (volunteer) {
            res.status(200).json(volunteer.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            return volunteer.destroy();
        }).then(function () {
            res.format({
                'text/html': function () {
                    alert.success(req, "Volunteer deleted.");
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

    router.route("/:id/approval")
    .put(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Volunteer does not exist."); }
            volunteer.approved = req.body.approved;
            return volunteer.save();
        }).then(function (volunteer) {
            if (req.body.sendMail === 'true') {
                return volunteer.getAccount().then(function (account) {
                    return communication.mail({
                        to: account.email,
                        from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
                        title: "Volunteer Approval",
                        template: "approve_volunteer",
                        variables: {
                            name: account.name,
                            affilation: account.affilation,
                            email: account.email,
                        },
                    });
                }).then(function () { return volunteer; });
            } else {
                return volunteer;
            }
        }).then(function (volunteer) {
            res.status(200).json({ state: volunteer.approved, });
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/applied")
    .put(middleware.auth, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Volunteer does not exist."); }
            if ((volunteer.AccountId !== req.session.account.id) && !req.session.ifAdmin) {
                throw new Error("The volunteer does not match account.");
            }
            volunteer.applied = req.body.applied;
            return volunteer.save();
        }).then(function (volunteer) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Volunteer CRC Application noted!");
                    res.redirect('/account');
                },
                'default': function () {
                    res.status(200).json({ state: volunteer.applied, });
                },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/followup")
    .put(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Volunteer does not exist."); }
            volunteer.followUp = req.body.followUp;
            return volunteer.save();
        }).then(function (volunteer) {
            res.status(200).json({ state: volunteer.followUp, });
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/csv")
    .get(middleware.admin, function (req, res) {
        db.Volunteer.findAll({
            // Deliberately empty
            include: [
                {
                    model: db.Account,
                    attributes: ["email", "name", "affiliation", "phone", "address", "city", "province", "postalCode"],
                }
            ],
            order: "id",
            raw: true
        }).then(function (volunteers) {
            // Process Schedule
            for (var vol_num=0; vol_num < volunteers.length; vol_num++) {
                volunteers[vol_num].tags = String(volunteers[vol_num].tags)
                volunteers[vol_num].applied = String(volunteers[vol_num].applied)
                volunteers[vol_num].approved = String(volunteers[vol_num].approved)
                volunteers[vol_num].followUp = String(volunteers[vol_num].followUp)
                var schedule = volunteers[vol_num].schedule;
                for (var i=0; i < schedule.length; i++) {
                    var entry = schedule[i];
                    var day = entry.day.split(",")[0];
                    if (entry.morning) {
                        volunteers[vol_num][day + "-morning-available"] = String(entry.morning.available);
                        volunteers[vol_num][day + "-morning-scheduled"] = String(entry.morning.scheduled);
                    }
                    if (entry.afternoon) {
                        volunteers[vol_num][day + "-afternoon-available"] = String(entry.afternoon.available);
                        volunteers[vol_num][day + "-afternoon-scheduled"] = String(entry.afternoon.scheduled);
                    }
                    if (entry.evening) {
                        volunteers[vol_num][day + "-evening-available"] = String(entry.evening.available);
                        volunteers[vol_num][day + "-evening-scheduled"] = String(entry.evening.scheduled);
                    }
                }
                delete volunteers[vol_num].schedule;
            }

            return new Promise(function (resolve, reject) {
                csv_stringify(volunteers, { header: true, escape: true }, function (err, out) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(out);
                    }
                });
            });
        }).then(function (volunteers) {
            res.contentType("text/csv");
            res.setHeader('Content-disposition', 'attachment; filename=volunteers.csv');
            res.send(volunteers);
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    return router;
};
