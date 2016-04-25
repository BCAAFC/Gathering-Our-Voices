"use strict";

var alert = require("../alert"),
    middleware = require("../middleware");

var gm = require("gm"),
    fs = require("fs"),
    Promise = require("bluebird");

var unlink = Promise.promisify(fs.unlink);

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(middleware.admin, function (req, res) {
        console.log(req.file);
        // Validate Path
        if (req.body.keyword.match(/\.|\/|\ |\$|`/g)) {
            return unlink(req.file.path)
            .then(function () {
                alert.error(req, "Form input looks suspicious, please remove any periods, slashes, spaces, or other odd characters from your input.");
                res.redirect("back");
            });
        } else if (req.file.filename.length < 1) {
            return unlink(req.file.path)
            .then(function () {
                alert.error(req, "No upload.");
                res.redirect("back");
            });
        }
        // Save Image
        gm(req.file.path)
        .autoOrient()
        .resize(req.body.size, req.body.size, ">")
        .noProfile()
        .write(process.env.UPLOAD_DIR + "images/" + req.body.keyword + ".jpg", function (err, data) {
            if (err) {
                console.log(err);
                res.status(401).json({ error: err.message });
                return;
            } else {
                alert.success(req, "Uploaded!");
                res.redirect('back');
                return;
            }
        });
    });

    router.route("/:keyword").delete(middleware.admin, function (req, res) {
        unlink(process.env.UPLOAD_DIR + "images/" + req.params.keyword + ".jpg")
        .then(function () {
            alert.success(req, "Deleted!");
            res.redirect('back');
            return;
        })
        .catch(function (err) {
            console.log(err);
            alert.error(req, "Something went wrong.");
            res.redirect("back");
        });
    });

    router.route("/:keyword.jpg")
    .get(function (req, res) {
        res.sendFile(process.env.UPLOAD_DIR + "images/" + req.params.keyword + ".jpg", {
            root: ".",
        });
    });

    router.route("/:keyword.jpg")
    .put(middleware.admin, function (req, res) {
        console.log("Error: PUT keyword is not implemented.");
    });

    return router;
};
