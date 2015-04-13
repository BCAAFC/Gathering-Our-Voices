module.exports = {
    auth: function (req, res, next) {
        if (req.session && req.session.group) {
            next();
        } else {
            var message = "You're not authorized to visit this area, please log in.";
            console.error("User requested " + req.url + " and was not permitted by util.auth.");
            res.redirect('/account/login?message=' + message); // TODO: URL Encode?
        }
    },
    admin: function (req, res, next) {
        if (req.session && req.session.group && req.session.isAdmin) {
            next();
        } else {
            var message = "You're not an administrator, and thusly cannot do this action.";
            console.error("User requested " + req.url + " and was not permitted by util.admin.");
            res.redirect('/account/login?message=' + message); // TODO: URL Encode?
        }
    },
};
