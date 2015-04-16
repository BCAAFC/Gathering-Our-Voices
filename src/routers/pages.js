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
            } else if (req.session && req.session.isAdmin) {
                res.render("default", {
                    title: "Not created...",
                    content: "Not created yet...",
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    featured: req.featured,
                });
            } else {
                res.status(404);
                console.warn('Path `' + req.originalUrl + '`does not exist.');
                res.send('Path `' + req.originalUrl + '`does not exist.');
            }
        });
    });

    return router;
};
