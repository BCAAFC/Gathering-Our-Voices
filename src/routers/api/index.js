module.exports = function (db, redis) {
    var router = require("express").Router();

    router.use("/account",
        require("./account")(db, redis));
    router.use("/workshop",
        require("./workshop")(db, redis));
    router.use("/exhibitor",
        require("./exhibitor")(db, redis));
    router.use("/group",
        require("./group")(db, redis));
    router.use("/member",
        require("./member")(db, redis));
    router.use("/page",
        require("./page")(db, redis));

    return router;
};
