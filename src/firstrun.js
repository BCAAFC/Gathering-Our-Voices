module.exports = function (env, db) {
    db.sequelize.sync().then(function () {
        return db.Page.create({
            path: "/register",
            title: "Register",
            content: "{{> account_form null}}",
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
            content: "<meta http-equiv=refresh content=0;url=/admin/accounts>",
            requirements: "Administrator",
        });
    }).then(function () {
        return db.Page.create({
            path: "/admin/accounts",
            title: "Administration - Accounts",
            content: "{{> admin_bar}}\n{{> admin_account_table}}",
            requirements: "Administrator",
        });
    }).then(function () {
        return db.Page.create({
            path: "/admin/groups",
            title: "Administration - Groups",
            content: "{{> admin_bar}}\n{{> admin_group_table}}",
            requirements: "Administrator",
        });
    }).then(function () {
        return db.Page.create({
            path: "/admin/workshops",
            title: "Administration - Workshops",
            content: "{{> admin_bar}}\n{{> admin_workshop_table}}",
            requirements: "Administrator",
        });
    }).then(function () {
        return db.Page.create({
            path: "/admin/exhibitors",
            title: "Administration - exhibitors",
            content: "{{> admin_bar}}\n{{> admin_exhibitor_table}}",
            requirements: "Administrator",
        });
    }).then(function () {
        return console.log("Done $FIRSTRUN.");
    });
};
