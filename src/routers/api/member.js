var middleware = require("../../middleware");

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
            if (!req.body.gender) { req.body.gender = null; }
            return req.session.account.Group.createMember(req.body);
        }).then(function (member) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(member); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
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
            if (!req.body.gender) { req.body.gender = null; }
        });
    });

    return router;
};
