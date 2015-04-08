"use strict";

module.exports = function (sequelize, DataTypes) {
    var Exhibitor = sequelize.define("Exhibitor", {
        // Info
    }, {
        classMethods: {
            associate: function (models) {
                Exhibitor.belongsTo(models.Account);
            }
        }
    });

    return Exhibitor;
};
