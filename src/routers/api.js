module.exports = function (db, redis) {
    var router = require("express").Router();

    router.post("/auth", function (req, res) {
        if (req.body.email && req.body.password) {
            db.Account.auth(req.body.email, req.body.password).then(function (account) {
                req.session.account = account;
                res.format({
                  'text/html': function(){
                    res.redirect("/account");
                  },
                  'application/json': function(){
                    res.json(account);
                  },
                  'default': function() {
                    // log the request and respond with 406
                    res.redirect("/account");
                  }
                });
            }).catch(function (error) {
                res.status(401).json({ error: error.message });
            });
        } else {
            res.status(401).json({ error: "Not enough information." });
        }
    });

    return router;
};
