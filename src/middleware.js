module.exports = {
    auth: function (req, res, next) {
        if (req.session && req.session.account) {
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in.";
            console.error("User requested " + req.url + " and was not permitted by util.auth.");
            res.format({
                "application/json": function (){
                    res.status(401).send({ message: message });
                },
                "default": function () {
                    res.redirect('/account/login?message=' + message); // TODO: URL Encode?
                },
            });
        }
    },
    ownAccount: function (req, res, next) {
        if (req.session && req.session.account && req.session.account == req.params.id) {
            next();
        } else if (req.session && req.session.isAdmin) {
            // Always allow admins.
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in to the correct group.";
            console.error("User requested " + req.url + " and was not permitted by util.ownAccount.");
            res.format({
                "application/json": function (){
                    res.status(401).send({ message: message });
                },
                "default": function () {
                    res.redirect('/account/login?message=' + message); // TODO: URL Encode?
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
                "application/json": function (){
                    res.status(401).send({ message: message });
                },
                "default": function () {
                    res.redirect('/account/login?message=' + message); // TODO: URL Encode?
                },
            });
        }
    },
};
