module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.url },
        }).then(function (page) {
            if (page) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                });
            } else {
                console.warn('Path `' + req.originalUrl + '`does not exist.');
                res.status(404).send('Path `' + req.originalUrl + '`does not exist.');
            }
        });
    });

    return router;
};
