var middleware = require("../../middleware");

module.exports = function (db, redis) {
    var router = require("express").Router();

    // Authenticate and login.
    router.post("/auth", function (req, res) {
        db.Account.auth(req.body.email, req.body.password).then(function (account) {
            req.session.account = account.id;
            if (process.env.ADMINS.indexOf(account.email) !== -1) {
                req.session.isAdmin = true;
            }
            res.status(200)(account);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    });

    // Logout.
    router.get("/logout", function (req, res) {
        if (req.session.account) { delete req.session.account; };
        if (req.session.isAdmin) { delete req.session.isAdmin; };
        res.status(200).json({});
    });

    router.route("/")
    // Send all accounts.
    .get(middleware.admin, function (req, res) {
        // TODO: Costs?
        db.Account.findAll({}).then(function (accounts) {
            res.status(200).json(accounts);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    })
    // Account creation.
    .post(function (req, res) {
        db.Account.create(req.body).then(function (account) {
            req.session.account = account.id;
            if (process.env.ADMINS.indexOf(account.email) !== -1) {
                req.session.isAdmin = true;
            }
            res.status(200).json(account);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    });

    router.route("/:id")
    // Send a given account.
    .get(middleware.ownAccount, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist"); }
            res.status(200).json(account);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    })
    // Edit an account.
    .put(middleware.ownAccount, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist"); }
            // Edit details in a batch.
            account.email = req.body.email || account.email;
            account.password = req.body.password || account.password;
            account.name = req.body.name || account.name;
            account.affiliation = req.body.affiliation || account.affiliation;
            account.phone = req.body.phone || account.phone;
            account.fax = req.body.fax || account.fax;
            account.address = req.body.address || account.address;
            account.city = req.body.city || account.city;
            account.province = req.body.province || account.province;
            account.postalCode = req.body.postalCode || account.postalCode;
            // Save.
            return account.save();
        }).then(function (account) {
            res.status(200).json(account);
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    })
    // Delete an account.
    .delete(middleware.admin, function (req, res) {
        db.Account.findOne({ where: { id: req.params.id, }, }).then(function (account) {
            if (!account) { throw new Error("Account doesn't exist"); }
            return account.destroy();
        }).then(function () {
            res.status(200).json({});
        }).catch(function (error) {
            res.status(401).json({ error: error.message });
        });
    });

    return router;
};
