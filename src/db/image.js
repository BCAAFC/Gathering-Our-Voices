"use strict";

module.exports = function (sequelize, DataTypes) {
    var Image = sequelize.define("Image", {
        keyword: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
        },
        caption: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultVaue: "",
        },
        data: {
            type: DataTypes.BLOB,
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        classMethods: {
            associate: function(models) {
                return;
            }
        }
    });

    return Image;
};
