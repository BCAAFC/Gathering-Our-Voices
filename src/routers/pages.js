module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/*", function (req, res) {
        db.Page.findOne({
            where: { path: req.url },
        }).then(function (page) {
            res.send(page);
        }).catch(function (error) {
            console.error(error);
            throw "Not found";
        });
    });

    return router;
};
