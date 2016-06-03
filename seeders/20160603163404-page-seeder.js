'use strict';

var fs = require('fs');

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Pages', [
            {
                path: "/register",
                title: "Register",
                content: fs.readFileSync("setup/register.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/login",
                title: "Login",
                content: fs.readFileSync("setup/login.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/news",
                title: "News",
                content: fs.readFileSync("setup/news.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/conduct",
                title: "Code of Conduct",
                content: fs.readFileSync("setup/conduct.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/about",
                title: "About",
                content: fs.readFileSync("setup/about.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/schedule",
                title: "Schedule",
                content: fs.readFileSync("setup/schedule.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/venues",
                title: "Venues",
                content: fs.readFileSync("setup/venues.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/faq",
                title: "F.A.Q.s",
                content: fs.readFileSync("setup/faq.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            },
            {
                path: "/privacy",
                title: "Privacy Policy",
                content: fs.readFileSync("setup/privacy.hbs", { encoding: "utf8", }),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            }]);
        },

        down: function (queryInterface, Sequelize) {
            return queryInterface.bulkDelete('Pages', {
                where: {
                    path: {
                        $in: [
                            "/register",
                            "/login",
                            "/news",
                            "/conduct",
                            "/about",
                            "/schedule",
                            "/venues",
                            "/faq",
                            "/privacy"
                        ]
                    }
                },
            }, {}, {});
        }
    };
