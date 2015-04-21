module.exports = function (env, db) {
    db.sequelize.sync().then(function () {
        return db.Page.create({
            path: "/register",
            title: "Register",
            content: "{{> account_form_POST}}",
        });
    }).then(function () {
        return db.Page.create({
            path: "/login",
            title: "Login",
            content: "{{> login_form}}",
        });
    }).then(function () {
        return db.Page.create({
            path: "/",
            title: "Home",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/news",
            title: "News",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/about",
            title: "About",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/schedule",
            title: "Schedule",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/venues",
            title: "Venues",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/accommodations",
            title: "Accommodations",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/workshops",
            title: "Workshops",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/faq",
            title: "faq",
            content: "",
        });
    }).then(function () {
        return db.Page.create({
            path: "/account",
            title: "Account",
            content: "",
            requirements: "Authenticated",
        });
    }).then(function () {
        return db.Page.create({
            path: "/admin",
            title: "Administration",
            content: "",
            requirements: "Administrator",
        });
    });
};
