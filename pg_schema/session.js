"use strict";

module.exports = function(sequelize, DataTypes) {
    var Session = sequelize.define("User", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
        start: {
            type: DataTypes.DATE,
            validate: {
                notNull: true,
            },
        },
        end: {
            type: DataTypes.DATE,
            validate: {
                notNull: true,
            },
        },
        room: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        venue: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        capacity: {
            type: DataTypes.INTEGER,
            validate: {
                notNull: true,
            },
        },
    }, {
        classMethods: {
            associate: function(models) {
                Session.hasMany(models.Member);
                Session.belongsTo(models.Workshop);
            }
        }
    });

    return Session;
};
