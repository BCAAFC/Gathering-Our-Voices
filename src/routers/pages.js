module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.url },
        }).then(function (page) {
            if (page) {
                res.render("default", {
                    title: page.title,
                    content: page.render(),
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    featured: req.featured,
                });
            } else {
                console.warn('Path `' + req.originalUrl + '`does not exist.');
                res.status(404).send('Path `' + req.originalUrl + '`does not exist.');
            }
        });
    });

    return router;
};
