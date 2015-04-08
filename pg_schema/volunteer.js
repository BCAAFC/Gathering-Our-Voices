"use strict";

module.exports = function (sequelize, DataTypes) {
    var Volunteer = sequelize.define("Volunteer", {
        // Info
    }, {
        classMethods: {
            associate: function(models) {
                Volunteer.hasMany(models.Member);
                Volunteer.belongsTo(models.Account);
            }
        }
    });

    return Volunteer;
};
