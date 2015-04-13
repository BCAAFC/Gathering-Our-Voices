module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/", function (req, res) { res.render("index"); });

    return router;
};
