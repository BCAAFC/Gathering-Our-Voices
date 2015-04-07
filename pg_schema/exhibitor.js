"use strict";

module.exports = function(sequelize, DataTypes) {
    var Exhibitor = sequelize.define("User", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
    }, {
        classMethods: {
            associate: function(models) {
                Exhibitor.hasMany(models.Member);
                Exhibitor.hasOne(models.Account);
            }
        }
    });

    return Exhibitor;
};
