module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/", function (req, res) {
        res.send("Foobar!");
    });

    return router;
};
