module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.url },
        }).then(function (page) {
            if (page) {
                res.send(page);
            } else {
                res.status(404);
                console.warn('Path `' + req.originalUrl + '`does not exist.');
                res.send('Path `' + req.originalUrl + '`does not exist.');
            }
        });
    });

    return router;
};
