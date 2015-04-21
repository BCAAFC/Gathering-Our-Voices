module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.url },
        }).then(function (page) {
            if (!page) {
                throw new Error("Path `" + req.originalUrl + "`does not exist.");
            } else if (page.requirements === "Normal") {
                return page;
            } else {
                if (page.requirements === "Authenticated" && !req.session.account) {
                    throw new Error("You are not authenticated.");
                } else if (page.requirements === "Administrator" && !req.session.isAdmin) {
                    throw new Error("You are not an administrator");
                }
                // Refresh account information.
                return db.Account.findOne({
                    where: { id: req.session.account.id, },
                    include: [{ all: true, nested: true, }]
                }).then(function (account) {
                    req.session.account = account;
                    return page;
                });
            }
        }).then(function (page) {
            page.render(res, "default", {
                title: page.title,
                account: req.session.account,
                admin: req.session.isAdmin,
                alert: req.alert,
            });
        }).catch(function (error) {
            console.warn(error.message);
            res.status(404).send(error.message);
        });
    });

    return router;
};
