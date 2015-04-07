"use strict";

module.exports = function(sequelize, DataTypes) {
    var Volunteer = sequelize.define("Volunteer", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
    }, {
        classMethods: {
            associate: function(models) {
                Volunteer.hasMany(models.Member);
                Volunteer.hasOne(models.Account);
            }
        }
    });

    return Volunteer;
};
