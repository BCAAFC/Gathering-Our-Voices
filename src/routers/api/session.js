var middleware = require("../../middleware"),
    alert = require("../../alert"),
    communication = require("../../communication"),
    csv_stringify = require("csv-stringify"),
    Promise = require('bluebird');

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(middleware.admin, function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                {
                    model: db.Workshop,
                    include: [ db.Session, ],
                    where: {
                        id: req.body.workshop,
                    }
                },
            ],
        }).then(function (account) {
            if (account.Workshops.length !== 1) {
                throw new Error("That workshop not associated with this account.");
            }
            return account.Workshops[0].createSession(req.body);
        }).then(function (workshop) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Updated workshop session");
                    res.redirect('/account/workshop/' + req.body.workshop);
                },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id")
    .put(middleware.admin, function (req, res) {
        // TODO: Can probably query this smarter.
        Promise.join(
            db.Session.findOne({
                where: { id: req.params.id },
            }),
            db.Account.findOne({
                where: { id: req.session.account.id },
                attributes: ["id"],
                include: [db.Workshop],
            }),
            function (session, account) {
                // Validations.
                if (account.Workshops.map(function (v) { return v.id; }).indexOf(session.WorkshopId) === -1) {
                    throw new Error("That Account is not associated with this workshop.");
                }
                return session;
        }).then(function (session) {
            session.start = new Date(req.body.start) || session.start;
            session.end = new Date(req.body.end) || session.end;
            session.room = req.body.room || session.room;
            session.venue = req.body.venue || session.venue;
            session.capacity = req.body.capacity || session.capacity;
            return session.save();
        }).then(function (session) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Updated workshop session");
                    res.redirect('/account/workshop/' + session.WorkshopId);
                },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/delete/:id")
    .get(middleware.admin, function (req, res) {
        db.Session.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: db.Member,
                    include: [{
                        model: db.Group,
                        include: [db.Account, ],
                    }],
                },
                db.Workshop,
            ],
        }).then(function (session) {
            return Promise.map(session.Members, function (member) {
                communication.mail({
                    to: member.Group.Account.email,
                    from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
                    cc: 'dpreston@bcaafc.com',
                    title: "Workshop Session Cancelled",
                    template: "session_cancelled",
                    variables: {
                        affiliation: member.Group.Account.affiliation,
                        name: member.name,
                        workshop: session.Workshop.title,
                        start: session.start.toLocaleString(),
                        end: session.end.toLocaleString(),
                    },
                });
            }).then(function () {
                return session.destroy();
            });
        }).then(function (session) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Deleted session.");
                    res.redirect('/account');
                },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id/add")
    .post(function (req, res) {
        Promise.join(
            db.Session.findOne({
                where: { id: req.params.id },
                include: [db.Member],
            }).then(function (session) {
                if (!session) { throw new Error("Session not found."); }
                return session;
            }),
            // Need to ensure member is in group.
            db.Account.findOne({
                where: { id: req.session.account.id },
                include: [ db.Group ],
            }).then(function (acc) {
                if (!acc) { throw new Error("Account not found."); }
                if (!acc.Group) { throw new Error("Account has no group associated."); }
                return acc.Group.getMembers({
                    where: { id: req.body.member, },
                });
            }),
            function (session, members) {
                if (members === []) { throw new Error("Member not found."); }
                var member = members[0];
                if (session.Members.length < session.capacity) {
                    return member.checkConflicts(session).then(function () {
                        return session.addMember(member);
                    });
                } else {
                    throw new Error("Session full.");
                }
            }
        ).then(function (session) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Added member to session.");
                    res.redirect('back');
                },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    router.route("/:id/emergencyinfo")
    .get(middleware.admin, function (req, res) {
        db.Session.findOne({
            where: { id: req.params.id },
            attributes: ["id"],
            include: [{
                model: db.Member,
                attributes: ["name", "medicalNumber", "contactName", "contactPhone", "allergies", "conditions"],
            }],
            order: ["name"]
        }).then(function (session) {
            var members = [];
            for (var i=0; i < session.Members.length; i++) {
                members.push(session.Members[i].toJSON());
            }
            return new Promise(function (resolve, reject) {
                csv_stringify(members, { header: true, escape: true }, function (err, out) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(out);
                    }
                });
            });
        }).then(function (data) {
            res.contentType("text/csv");
            res.setHeader('Content-disposition', 'attachment; filename=members.csv');
            res.send(data);
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id/remove/:member")
    .get(function (req, res) {
        Promise.join(
            db.Session.findOne({
                where: { id: req.params.id },
            }).then(function (session) {
                if (!session) { throw new Error("Session not found."); }
                return session;
            }),
            // Need to ensure member is in group.
            db.Account.findOne({
                where: { id: req.session.account.id },
                include: [ db.Group ],
            }).then(function (acc) {
                if (!acc) { throw new Error("Account not found."); }
                return acc.Group.getMembers({
                    where: { id: req.params.member, },
                });
            }),
            function (session, members) {
                if (members === []) { throw new Error("Member not found."); }
                var member = members[0];
                return session.removeMember(member);
            }
        ).then(function (session) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Removed member from session.");
                    res.redirect('back');
                },
                'default': function () { res.status(200).json(session); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
