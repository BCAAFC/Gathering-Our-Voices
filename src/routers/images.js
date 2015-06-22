var fs = require('fs'),
    alert = require("../alert");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.get("/", function (req, res) {
        fs.readdir(process.env.UPLOAD_DIR + "images/", function (err, files) {
            if (err) {
                alert.error(req, err.message);
                console.log(err);
                return res.redirect("back");
            }
            files = files
                .filter(function (val) { return val[0] !== '.'; })
                .map(function (val) { return val.split(".").shift(); });
            db.Page.findOne({
                where: { path: "/images", },
            // I don't like this but I don't really see a nice way of collapsing this into a reusable.
            }).then(function (page) {
                if (!page) {
                    throw new Error("Path `" + req.originalUrl + "`does not exist.");
                } else if (page.requirements === "Normal") {
                    return page;
                } else {
                    if (page.requirements === "Authenticated" && !req.session.account) {
                        throw new Error("You are not authenticated.");
                    } else if (page.requirements === "Administrator" && !req.session.isAdmin) {
                        throw new Error("You are not an administrator");
                    }
                    // Refresh account information.
                    return db.Account.findOne({
                        where: { id: req.session.account.id, },
                        include: [{ all: true, nested: true, }]
                    }).then(function (account) {
                        req.session.account = account;
                        return page;
                    });
                }
            }).then(function (page) {
                page.render(res, "default", {
                    title: page.title,
                    account: req.session.account,
                    admin: req.session.isAdmin,
                    alert: req.alert,
                    files: files,
                });
            }).catch(function (error) {
                console.warn(error.message);
                res.status(404).send(error.message);
            });
        });
    });

    return router;
};
