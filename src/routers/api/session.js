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
            session.start = Date(req.body.start) || session.start;
            session.end = Date(req.body.end) || session.end;
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

    router.route("/:id/add/:member")
    .get(middleware.admin, function (req, res) {
        Promise.join(
            db.Session.findOne({
                where: { id: req.params.id },
            }).then(function (session) {
                if (!session) { throw new Error("Session not found."); }
                return session;
            }),
            db.Member.findOne({
                where: { id: req.params.member },
            }).then(function (member) {
                if (!member) { throw new Error("Member not found."); }
                return member;
            }),
            function (session, member) {
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

    return router;
};
