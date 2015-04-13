var middleware = require("../middleware");

module.exports = function (httpd, db, redis) {

    httpd.use("/", require("./root")(db, redis));
    httpd.use("/account", require("./account")(db, redis));
    httpd.use("/workshops", require("./workshops")(db, redis));
    httpd.use("/admin", middleware.admin, require("./admin")(db, redis));

    // 404
    httpd.use(function notFoundHandler(req, res) {
        res.status(404);
        console.warn('Path `' + req.originalUrl + '`does not exist.');
        res.send('Path `' + req.originalUrl + '`does not exist.');
    });

    return httpd;
};
