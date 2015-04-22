var gm = require("gm"),
    middleware = require("../../middleware");

module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .post(middleware.admin, function (req, res) {
        gm(req.files.data.path)
        .autoOrient()
        .resize(req.body.size, req.body.size, ">")
        .noProfile()
        .toBuffer("JPG", function (err, data) {
            if (err) { throw err; }
            db.Image.create({
                keyword: req.body.keyword,
                caption: req.body.caption,
                data: data,
                size: req.body.size,
            }).then(function (image) {
                res.format({
                    'text/html': function () { res.redirect('back'); },
                    'default': function () { res.status(200).json(image); },
                });
            }).catch(function (error) {
                console.log(error);
                res.status(401).json({ error: error.message });
            });
        });
    });

    router.route("/:keyword.jpg")
    .get(function (req, res) {
        db.Image.findOne({
            where: { keyword: req.params.keyword, },
        }).then(function (image) {
            if (!image) { throw new Error("Image does not exist"); }
            res.send(image.data);
        }).catch(function (error) {
            console.log(error);
            res.status(500).send();
        });
    });

    router.route("/:keyword")
    .get(function (req, res) {
        db.Image.findOne({
            where: { keyword: req.params.keyword, },
        }).then(function (image) {
            if (!image) { throw new Error("Image does not exist"); }
            res.send(image);
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    })
    .put(middleware.admin, function (req, res) {
        db.Image.findOne({
            where: { keyword: req.params.keyword },
        }).then(function (image) {
            // Validations.
            return image;
        }).then(function (image) {

            return image.save();
        }).then(function (image) {
            res.format({
                'text/html': function () { res.redirect('back'); },
                'default': function () { res.status(200).json(image); },
            });
        }).catch(function (error) {
            console.log(error);
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
