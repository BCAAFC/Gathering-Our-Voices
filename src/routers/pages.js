var hbs = require("hbs");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.originalUrl },
        }).then(function (page) {
            page.render(res, "layout", {
                title: page.title,
                account: req.session.account,
                flags: db.Flag.cache(),
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
