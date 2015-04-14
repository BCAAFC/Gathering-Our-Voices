"use strict";

var marked = require("marked");

module.exports = function (sequelize, DataTypes) {
    var Page = sequelize.define("Page", {
        path: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        // Should be in Navbar.
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Assumed to be Markdown.
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        classMethods: {
            associate: function(models) {
                return;
            }
        },
        instanceMethods: {
            render: function () {
                return marked(this.content);
            }
        }
    });

    return Page;
};
