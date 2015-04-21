module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Workshop, },
            ],
        }).then(function (account) {
            if (account.Workshop) { throw new Error("Already workshop associated with this account."); }
            if (req.body.mailing === undefined) { req.body.mailing = false; }
            if (req.body.projector === undefined) { req.body.projector = false; }
            if (req.body.screen === undefined) { req.body.screen = false; }
            if (req.body.player === undefined) { req.body.player = false; }
            if (req.body.meals === undefined) { req.body.meals = false; }
            if (req.body.accomodation === undefined) { req.body.accomodation = false; }
            if (typeof req.body.audience === "string") { req.body.audience = [req.body.audience]; }
            if (typeof req.body.type === "string") { req.body.type = [req.body.type]; }
            return account.createWorkshop(req.body);
        }).then(function (workshop) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(workshop); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id")
    .put(function (req, res) {
        db.Workshop.findOne({
            where: { id: req.params.id },
        }).then(function (workshop) {
            // Validations.
            if (workshop.id !== req.session.account.Workshop.id) {
                throw new Error("That workshop is not associated with this account.");
            }
            if (req.body.mailing === undefined) { req.body.mailing = false; }
            if (req.body.projector === undefined) { req.body.projector = false; }
            if (req.body.screen === undefined) { req.body.screen = false; }
            if (req.body.player === undefined) { req.body.player = false; }
            if (req.body.meals === undefined) { req.body.meals = false; }
            if (req.body.accomodation === undefined) { req.body.accomodation = false; }
            if (typeof req.body.audience === "string") { req.body.audience = [req.body.audience]; }
            if (typeof req.body.type === "string") { req.body.type = [req.body.type]; }
            return workshop;
        }).then(function (workshop) {
            workshop.title = req.body.title || workshop.title;
            workshop.length = req.body.length || workshop.length;
            workshop.category = req.body.category || workshop.category;
            workshop.categoryReason = req.body.categoryReason || workshop.categoryReason;
            workshop.audience = req.body.audience || workshop.audience;
            workshop.type = req.body.type || workshop.type;
            workshop.description = req.body.description || workshop.description;
            workshop.summary = req.body.summary || workshop.summary;
            workshop.interactionLevel = req.body.interactionLevel || workshop.interactionLevel;
            workshop.capacity = req.body.capacity || workshop.capacity;
            workshop.mailing = req.body.mailing; // Can't do "|| workshop.mailing;" since might be false.
            workshop.flipchart = req.body.flipchart || workshop.flipchart;
            workshop.projector = req.body.projector; // Can't do "|| workshop.projector;" since might be false.
            workshop.screen = req.body.screen; // Can't do "|| workshop.screen;" since might be false.
            workshop.player = req.body.player; // Can't do "|| workshop.player;" since might be false.
            workshop.room = req.body.room || workshop.room;
            workshop.biography = req.body.biography || workshop.biography;
            workshop.meals = req.body.meals; // Can't do "|| workshop.meals;" since might be false.
            workshop.accomodation = req.body.accomodation; // Can't do "|| workshop.accomodation;" since might be false.
            workshop.travel = req.body.travel || workshop.travel;
            workshop.honorarium = req.body.honorarium || workshop.honorarium;
            workshop.notes = req.body.notes || workshop.notes;
            return workshop.save();
        }).then(function (workshop) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(workshop); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
