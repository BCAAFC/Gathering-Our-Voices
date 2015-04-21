"use strict";

var hbs = require("hbs");
hbs.registerPartials('./views/partials');



module.exports = function (sequelize, DataTypes) {
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
            }
        },
        instanceMethods: {
            render: function (res, target, data) {
                data.content = hbs.compile(this.content)(data);
                return res.render(target, data);
            },
        },
        hooks: {
            beforeUpdate: function (page, options, fn) {
                page.rollback = page._previousDataValues.content;
                fn(null, page);
          },
        },
    });

    return Page;
};
