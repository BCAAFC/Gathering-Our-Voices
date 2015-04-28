var middleware = require("../../middleware");

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
            // Defaults.
            // Transform HTML form.
            if (req.body.mailing === "Yes") { req.body.mailing = true; } else
            if (req.body.mailing === "No") { req.body.mailing = false; }
            if (req.body.projector === "Yes") { req.body.projector = true; } else
            if (req.body.projector === "No") { req.body.projector = false; }
            if (req.body.player === "Yes") { req.body.player = true; } else
            if (req.body.player === "No") { req.body.player = false; }
            if (req.body.meals === "Yes") { req.body.meals = true; } else
            if (req.body.meals === "No") { req.body.meals = false; }
            if (req.body.accomodation === "Yes") { req.body.accomodation = true; } else
            if (req.body.accomodation === "No") { req.body.accomodation = false; }
            if (req.body.microphone === "Yes") { req.body.microphone = true; } else
            if (req.body.microphone === "No") { req.body.microphone = false; }
            // Strip
            if (!req.session.isAdmin) {
                delete req.body.verified;
                delete req.body.approved;
                delete req.body.tags;
            }
            // Create
            console.log(req.body);
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
            // Transform HTML form.
            if (req.body.mailing === "Yes") { req.body.mailing = true; } else
            if (req.body.mailing === "No") { req.body.mailing = false; }
            if (req.body.projector === "Yes") { req.body.projector = true; } else
            if (req.body.projector === "No") { req.body.projector = false; }
            if (req.body.player === "Yes") { req.body.player = true; } else
            if (req.body.player === "No") { req.body.player = false; }
            if (req.body.meals === "Yes") { req.body.meals = true; } else
            if (req.body.meals === "No") { req.body.meals = false; }
            if (req.body.accomodation === "Yes") { req.body.accomodation = true; } else
            if (req.body.accomodation === "No") { req.body.accomodation = false; }
            if (req.body.microphone === "Yes") { req.body.microphone = true; } else
            if (req.body.microphone === "No") { req.body.microphone = false; }

            if (typeof req.body.audience === "string") { req.body.audience = [req.body.audience]; }
            if (typeof req.body.type === "string") { req.body.type = [req.body.type]; }
            return workshop;
        }).then(function (workshop) {
            workshop.title = req.body.title || workshop.title;
            exhibitor.facilitators = req.body.facilitators || exhibitor.facilitators;
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
            // Admin
            if (req.session.isAdmin) {
                workshop.verified = req.body.verified;
                workshop.approved = req.body.approved;
                workshop.tags = req.body.tags;
            }

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

    router.route("/:id/tags")
    .put(middleware.admin, function (req, res) {
        db.Workshop.findOne({
            where: { id: req.params.id, },
        }).then(function (workshop) {
            if (workshop.tags.indexOf(req.body.add) !== -1) {
                throw new Error("Tag already exists.");
            } else {
                workshop.tags.push(req.body.add);
                return workshop.save({fields: ['tags']});
            }
        }).then(function (workshop) {
            res.status(200).json(workshop.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    })
    .delete(middleware.admin, function (req, res) {
        db.Workshop.findOne({
            where: { id: req.params.id, },
        }).then(function (workshop) {
            var idx = workshop.tags.indexOf(req.body.add);
            if (idx === -1) {
                workshop.tags.splice(idx, 1);
                return workshop.save({fields: ['tags']});
            } else {
                throw new Error("Tag does not exist.");
            }
        }).then(function (workshop) {
            res.status(200).json(workshop.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/approval")
    .put(middleware.admin, function (req, res) {
        db.Workshop.findOne({
            where: { id: req.params.id, },
        }).then(function (workshop) {
            if (!workshop) { throw new Error("Workshop does not exist."); }
            workshop.approved = req.body.approved;
            return workshop.save();
        }).then(function (workshop) {
            res.status(200).json({ state: workshop.approved, });
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    router.route("/:id/verification")
    .put(middleware.admin, function (req, res) {
        db.Workshop.findOne({
            where: { id: req.params.id, },
        }).then(function (workshop) {
            if (!workshop) { throw new Error("Workshop does not exist."); }
            workshop.verified = req.body.verified;
            return workshop.save();
        }).then(function (workshop) {
            res.status(200).json({ state: workshop.verified, });
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    return router;
};
