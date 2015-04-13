module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/", function (req, res) {
        res.render("default", { content: "Test" });
    });

    return router;
};
