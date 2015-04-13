"use strict";

module.exports = function (sequelize, DataTypes) {
    var Image = sequelize.define("Image", {
        caption: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultVaue: "",
        },
        data: {
            type: DataTypes.BLOB,
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
