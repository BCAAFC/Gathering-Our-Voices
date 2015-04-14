module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/", function (req, res) {
        res.send("Foobar!");
    });

    router.get("/editor", function (req, res) {
        db.Page.findAll({}).then(function (pages) {
            res.render("editor", {
                pages: pages,
            });
        });
    });

    return router;
};
