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
            if (!req.body.background) { req.body.background = null; }
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
                'text/html': function () {
                    alert.success(req, "Member added.");
                    res.redirect('/account/group');
                },
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
            if (!req.body.background) { req.body.background = null; }
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
                member.cost = req.body.cost || member.cost;
                member.tags = req.body.tags || member.tags;
            }
            // Save
            return member.save();
        }).then(function (member) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Member updated.");
                    res.redirect('/account/group');
                },
                'default': function () { res.status(200).json(account); },
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
        db.Member.findOne({
            where: { id: req.params.id, },
        }).then(function (member) {
            if (member.tags.indexOf(req.body.add) !== -1) {
                throw new Error("Tag already exists.");
            } else {
                member.tags.push(req.body.add);
                return member.save({fields: ['tags']});
            }
        }).then(function (member) {
            res.status(200).json(member.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    })
    .delete(middleware.admin, function (req, res) {
        db.Member.findOne({
            where: { id: req.params.id, },
        }).then(function (member) {
            if (!member) { throw new Error("Member not found."); }
            var idx = member.tags.indexOf(req.body.add);
            if (idx === -1) {
                member.tags.splice(idx, 1);
                return member.save({fields: ['tags']});
            } else {
                throw new Error("Tag does not exist.");
            }
        }).then(function (member) {
            res.status(200).json(member.tags);
        }).catch(function (error) {
            res.status(500).json({ error: error.message });
        });
    });

    // We use an `a` elem to do this can it can't be a DELETE
    router.route("/delete/:id")
    .get(middleware.auth, function (req, res) {
        db.Member.findOne({
            where: { id: req.params.id, },
        }).then(function (member) {
            // Error checking.
            if (!member) { throw new Error("Member not found."); }
            if (!req.session.account.Group || member.GroupId !== req.session.account.Group.id) {
                throw new Error("Member is not in your group.");
            }
            // TODO: Verify relationships are destroyed too?
            return member.destroy();
        }).then(function (member) {
            res.format({
                'text/html': function () {
                    alert.success(req, "Member deleted.");
                    res.redirect('/account/group');
                },
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
