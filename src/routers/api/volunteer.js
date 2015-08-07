var middleware = require("../../middleware"),
    moment = require("moment"),
    alert = require("../../alert");

function scaffoldDay(day, req, cur) {
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

    console.log(result);
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

            var schedule = [
                scaffoldDay("Sunday", req),
                scaffoldDay("Monday", req),
                scaffoldDay("Tuesday", req),
                scaffoldDay("Wednesday", req),
                scaffoldDay("Thursday", req),
            ];
            req.body.schedule = schedule;

            return account.createVolunteer(req.body);
        }).then(function (volunteer) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Volunteer application created!");
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

    router.route("/:id")
    .put(middleware.auth, function (req, res) {
        console.log(req.body);
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
                volunteer.applied = req.body.applied;
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
            var idx = volunteer.tags.indexOf(req.body.add);
            if (idx === -1) {
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

    // We use an `a` elem to do this can it can't be a DELETE
    // router.route("/delete/:id")
    // .get(middleware.auth, function (req, res) {
    //     db.Member.findOne({
    //         where: { id: req.params.id, },
    //     }).then(function (member) {
    //         // Error checking.
    //         if (!member) { throw new Error("Member not found."); }
    //         if (!req.session.account.Group || member.GroupId !== req.session.account.Group.id) {
    //             throw new Error("Member is not in your group.");
    //         }
    //         // TODO: Verify relationships are destroyed too?
    //         return member.destroy();
    //     }).then(function (member) {
    //         res.format({
    //             'text/html': function () {
    //                 alert.success(req, "Member deleted.");
    //                 res.redirect('/account/group');
    //             },
    //             'default': function () { res.status(200).json(account); },
    //         });
    //     }).catch(function (error) {
    //         res.format({
    //             'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
    //             'default': function () { res.status(401).json({ error: error.message }); },
    //         });
    //     });
    // });

    router.route("/:id/approval")
    .put(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Volunteer does not exist."); }
            volunteer.approved = req.body.approved;
            return volunteer.save();
        }).then(function (volunteer) {
            res.status(200).json({ state: volunteer.approved, });
        }).catch(function (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/applied")
    .put(middleware.admin, function (req, res) {
        db.Volunteer.findOne({
            where: { id: req.params.id, },
        }).then(function (volunteer) {
            if (!volunteer) { throw new Error("Volunteer does not exist."); }
            volunteer.applied = req.body.applied;
            return volunteer.save();
        }).then(function (volunteer) {
            res.status(200).json({ state: volunteer.applied, });
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

    return router;
};
