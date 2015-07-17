var middleware = require("../../middleware"),
    alert = require("../../alert"),
    Promise = require('bluebird');

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(middleware.admin, function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Workshop, include: [ db.Session, ], },
            ],
        }).then(function (account) {
            if (!account.Workshop) { throw new Error("No workshop associated with this account."); }
            return account.Workshop.createSession(req.body);
        }).then(function (workshop) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Updated workshop session");
                    res.redirect('/account/workshop');
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
        db.Session.findOne({
            where: { id: req.params.id },
        }).then(function (session) {
            // Validations.
            if (session.WorkshopId !== req.session.account.Workshop.id) {
                throw new Error("That session is not associated with this workshop.");
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
                    res.redirect('/account/workshop');
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
        }).then(function (session) {
            return session.destroy();
        }).then(function (session) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Deleted session.");
                    res.redirect('/account/workshop');
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
                return acc.Group.getMembers({
                    where: { id: req.body.member, },
                });
            }),
            function (session, members) {
                if (members === []) { throw new Error("Member not found."); }
                var member = members[0];
                if (session.Members.length < session.capacity) {
                    return session.addMember(member);
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
