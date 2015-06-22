var middleware = require("../middleware");

module.exports = function (httpd, db, redis) {
    // This is for DB stored images! Not statics!
    httpd.get("/", function (req, res) {
        res.render("special/landing", {
            title: "Landing Page",
        });
    });
    httpd.use("/images",
        require("./images")(db, redis));
    httpd.use("/api",
        require("./api")(db, redis));

    httpd.use(function (req, res, next) {
        // Consume message.
        if (req.session.alert) {
            req.alert = req.session.alert;
            delete req.session.alert;
        }
        return next();
    });
    // Admin routes.
    httpd.use("/admin", middleware.admin,
        require("./admin")(db, redis));
    // It's quite important that this is last.
    httpd.use("/",
        require("./pages")(db, redis));

    // 404
    httpd.use(function notFoundHandler(req, res) {
        res.status(404);
        console.warn('Path `' + req.originalUrl + '`does not exist.');
        res.send('Path `' + req.originalUrl + '`does not exist.');
    });

    return httpd;
};
