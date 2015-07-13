var Promise = require("bluebird"),
    fs = require("fs");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .get(function (req, res) {
        db.Workshop.findAll({
            where: { approved: true, verified: true, },
            attributes: ['id', 'title', 'facilitators', 'length', 'category', 'audience', 'summary'],
            include: [db.Session],
        }).then(function (workshops) {
            var columns = [
                { title: "View", data: null, className: "view", },
                { title: 'Title', data: 'title', className: 'title' },
                { title: 'Facilitators', data: 'facilitators', className: 'facilitators' },
                { title: 'Length', data: 'length', className: 'length' },
                { title: 'Category', data: 'category', className: 'category' },
                { title: 'Audience', data: 'audience', className: 'audience' },
                { title: 'Sessions', data: 'Sessions', className: 'sessions' },
                { title: 'Summary', data: 'summary', className: 'summary' },
            ];
            res.render("workshops/index", {
                title: "Workshop List",
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
                flags: db.Flag.cache(),
                data: workshops,
                columns: columns,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    router.route("/:id")
    .get(function (req, res) {
        Promise.join(
            db.Workshop.findOne({
                where: { id: req.params.id, },
                include: [{
                    model: db.Session,
                    include: [db.Member],
                }],
            }),
            new Promise(function (resolve, reject) {
                if (req.session.account) {
                    // Refresh account information.
                    return resolve(db.Account.findOne({
                        where: { id: req.session.account.id, },
                        // TODO: Only members.
                        include: [{
                            model: db.Group, include: [{
                                model: db.Member, include: [db.Session],
                            }],
                        }],
                    }).then(function (account) {
                        req.session.account = account;
                        return account;
                    }));
                } else {
                    return resolve(null);
                }
            }),
            function (workshop, account) {
                res.render("workshops/id", {
                    title: "Workshop Info",
                    account: account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    flags: db.Flag.cache(),
                    workshop: workshop,
                });
            }
        ).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    return router;
};
