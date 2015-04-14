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
                });
            } else if (req.session && req.session.isAdmin) {
                res.render("default", {
                    title: "Not created...",
                    content: "Not created yet...",
                    admin: req.session.isAdmin,
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
