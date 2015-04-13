"use strict";

var marked = require("marked");

module.exports = function (sequelize, DataTypes) {
    var Page = sequelize.define("Page", {
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
