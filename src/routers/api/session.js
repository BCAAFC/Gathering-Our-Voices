var middleware = require("../../middleare"),
    alert = require("../../alert");

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
            session.start = req.body.start || session.start;
            session.end = req.body.end || session.end;
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

    return router;
};
