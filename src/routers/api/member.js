var middleware = require("../../middleware"),
    moment = require("moment"),
    alert = require("../../alert");

// TODO: Make this ENV.
var EARLYBIRD_DEADLINE = new Date("February 6 2016"); // It's actually the 5th.

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(function (req, res) {
        db.Account.findOne({
            where: { id: req.session.account.id },
            include: [
                { model: db.Group, include: [ db.Member, ], },
            ],
        }).then(function (account) {
            // Verify
            if (!account.Group) {
                throw new Error("This account does not have a group declared.");
            }
            if (!req.body.email) { req.body.email = null; }
            if (!req.body.birthDate) { req.body.birthDate = null; }
            else { req.body.birthDate = new Date(req.body.birthDate); }
            if (!req.body.gender) { req.body.gender = null; }
            // Transform the form
            if (req.body.notifications === "Yes") { req.body.notifications = true; } else
            if (req.body.notifications === "No") { req.body.notifications = false; }
            // Determine cost
            if (new Date() < EARLYBIRD_DEADLINE) {
                // Earlybird.
                req.body.cost = 125;
            } else {
                // Regular
                req.body.cost = 175;
            }
            // Strip
            if (req.session.isAdmin) {
                delete req.body.cost;
                delete req.body.tags;
            }
            // Create
            return account.Group.createMember(req.body);
        }).then(function (member) {
            res.format({
                'text/html': function () { res.redirect('/account'); },
                'default': function () { res.status(200).json(account); },
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
        db.Member.findOne({
            where: { id: req.params.id },
        }).then(function (member) {
            // Verify member is in group.
            if (req.session.account.Group.id === member.Group) {
                throw new Error("The member specified is not in your group.");
            }
            // Transform the form
            if (req.body.notifications === "Yes") { req.body.notifications = true; } else
            if (req.body.notifications === "No") { req.body.notifications = false; }
            //
            if (!req.body.email) { req.body.email = null; }
            if (!req.body.birthDate) { req.body.birthDate = null; }
            else { req.body.birthDate = new Date(req.body.birthDate); }
            if (!req.body.gender) { req.body.gender = null; }
            // Update details.
            member.name = req.body.name;
            member.type = req.body.type;
            member.gender = req.body.gender;
            member.background = req.body.background;
            member.birthDate = req.body.birthDate;
            member.phone = req.body.phone;
            member.notifications = member.notifications;
            member.email = req.body.email;
            member.contactName = req.body.contactName;
            member.contactPhone = req.body.contactPhone;
            member.contactRelation = req.body.contactRelation;
            member.medicalNumber = req.body.medicalNumber;
            member.allergies = req.body.allergies;
            member.conditions = req.body.conditions;
            // Admin
            if (req.session.isAdmin) {
                member.cost = req.body.cost;
                member.tags = req.body.tags;
            }
            // Save
            return member.save();
        }).then(function (member) {
            res.format({
                'text/html': function () { res.redirect('/account'); },
                'default': function () { res.status(200).json(account); },
            });
        }).catch(function (error) {
            res.format({
                'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
                'default': function () { res.status(401).json({ error: error.message }); },
            });
        });
    });

    return router;
};
