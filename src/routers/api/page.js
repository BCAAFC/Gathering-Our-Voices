module.exports = function (db, redis) {
    var router = require("express").Router();

    router.route("/")
    .get(function (req, res) {
        db.Page.findAll({}).then(function (pages) {
            res.status(200).json(pages);
        });
    })
    .post(function (req, res) {
        db.Page.create(req.body).then(function (page) {
            res.status(200).json(page);
        });
    });

    router.route("/:id")
    .get(function (req, res) {
        db.Page.findOne({ where: { id: req.params.id } }).then(function (page) {
            if (!page) { throw new Error("Page not found."); }
            res.status(200).json(page);
        }).catch(function (error) {
            res.status(500).json({ message: error.message });
        });
    })
    .put(function (req, res) {
        db.Page.findOne({ where: { id: req.params.id } }).then(function (page) {
            if (!page) { throw new Error("Page not found."); }
            page.path = req.body.path || page.path;
            page.title = req.body.title || page.title;
            page.content = req.body.content || page.content;
            page.featured = req.body.featured || page.featured;
            return page.save();
        }).then(function (page) {
            res.status(200).json(page);
        }).catch(function (error) {
            res.status(500).json({ message: error.message });
        });
    })
    .delete(function (req, res) {
        db.Page.findOne({ where: { id: req.params.id } }).then(function (page) {
            if (!page) { throw new Error("Page not found."); }
            res.status(200).json(page);
        }).catch(function (error) {
            res.status(500).json({ message: error.message });
        });
    });


    return router;
};
