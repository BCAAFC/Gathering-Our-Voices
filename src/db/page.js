"use strict";

var hbs = require("hbs");

module.exports = function (sequelize, DataTypes) {
    var cache = {};
    var Page = sequelize.define("Page", {
        path: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        rollback: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        requirements: {
            type: DataTypes.ENUM,
            values: [ "Normal", "Authenticated", "Administrator" ],
            defaultValue: "Normal",
        },
    }, {
        classMethods: {
            associate: function(models) {
                return;
            },
            render: function (res, layout, path, data) {
                return new Promise((resolve, reject) => {
                    if (cache[path]) {
                        // Renders from the cache
                        data.title = cache[path].title
                        data.layout = null;
                        data.body = cache[path].render(data);
                        return res.render(layout, data);
                    } else {
                        // Refreshes the cache then tries to render it.
                        return this.refreshCache(Page).then(newCache => cache = newCache)
                            .then(_ => {
                                if (!cache[path]) { reject(new Error("No page found.")) }

                                data.title = cache[path].title
                                data.layout = null;
                                data.body = cache[path].render(data);
                                return res.render(layout, data);
                            });
                    }
                });
            },
            refreshCache: function (Page) {
                return this.findAll().then(function (pages) {
                    return pages.reduce(function (acc, page) {
                        acc[page.path] = {
                            render: hbs.compile(page.content),
                            title: page.title
                        };
                        return acc;
                    }, {});
                });
            }
        },
        instanceMethods: { },
        hooks: {
            beforeUpdate: function (page, options, fn) {
                page.rollback = page._previousDataValues.content;
                fn(null, page);
            },
            afterUpdate: function(page, options, fn) {
                this.refreshCache(Page).then(newCache => cache = newCache);
                fn(null, page);
            },
            afterCreate: function(page, options, fn) {
                this.refreshCache(Page).then(newCache => cache = newCache);
                fn(null, page);
            },
            afterDelete: function(page, options, fn) {
                this.refreshCache(Page).then(newCache => cache = newCache);
                fn(null, page);
            }
        },
    });

    // Build initial cache.
    Page.refreshCache().then(newCache => cache = newCache);

    return Page;
};
