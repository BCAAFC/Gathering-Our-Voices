var middleware = require("../../middleware"),
    moment = require("moment"),
    alert = require("../../alert");

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
            if (!req.body.email) { req.body.email = null; }
            if (!req.body.birthDate) { req.body.birthDate = null; }
            else { req.body.birthDate = new Date(req.body.birthDate); }
            if (!req.body.gender) { req.body.gender = null; }
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
        db.Member.findOne({
            where: { id: req.params.id },
        }).then(function (member) {
            // Verify member is in group.
            if (req.session.account.Group.id === member.Group) {
                throw new Error("The member specified is not in your group.");
            }
            if (!req.body.email) { req.body.email = null; }
            if (!req.body.birthDate) { req.body.birthDate = null; }
            else { req.body.birthDate = new Date(req.body.birthDate); }
            if (!req.body.gender) { req.body.gender = null; }
            // Update details.
            member.name = req.body.name || member.name;
            member.type = req.body.type || member.type;
            member.gender = req.body.gender || member.gender;
            member.birthDate = req.body.birthDate || member.birthDate;
            member.phone = req.body.phone || member.phone;
            member.email = req.body.email || member.email;
            member.contactName = req.body.contactName || member.contactName;
            member.contactPhone = req.body.contactPhone || member.contactPhone;
            member.contactRelation = req.body.contactRelation || member.contactRelation;
            member.medicalNumber = req.body.medicalNumber || member.medicalNumber;
            member.allergies = req.body.allergies || member.allergies;
            member.conditions = req.body.conditions || member.conditions;
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
