"use strict";

var alert = require("./alert");

module.exports = {
    auth: function (req, res, next) {
        if (req.session && req.session.account) {
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in.";
            console.error("User requested " + req.url + " and was not permitted by util.auth.");
            res.format({
                'text/html': function () {
                    alert.error(req, message);
                    res.redirect('/login?redirect=' + req.originalUrl); // TODO: URL Encode?
                },
                "default": function (){
                    res.status(401).send({ message: message });
                },
            });
        }
    },
    ownAccount: function (req, res, next) {
        if (req.session && req.session.account && req.session.account.id == req.params.id) {
            next();
        } else if (req.session && req.session.isAdmin) {
            // Always allow admins.
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in to the correct group.";
            console.error("User requested " + req.url + " and was not permitted by util.ownAccount.");
            res.format({
                'text/html': function () {
                    alert.error(req, message);
                    res.redirect('/login?redirect=' + req.originalUrl); // TODO: URL Encode?
                },
                "default": function (){
                    res.status(401).send({ message: message });
                },
            });
        }
    },
    admin: function (req, res, next) {
        if (req.session && req.session.isAdmin) {
            next();
        } else {
            var message = "You're not an administrator, and thusly cannot do this action.";
            console.error("User requested " + req.url + " and was not permitted by util.admin.");
            res.format({
                'text/html': function () {
                    alert.error(req, message);
                    res.redirect('/login?redirect=' + req.originalUrl); // TODO: URL Encode?
                },
                "default": function (){
                    res.status(401).send({ message: message });
                },
            });
        }
    },
};
