"use strict";

module.exports = function(sequelize, DataTypes) {
    var Workshop = sequelize.define("User", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
        name: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            }
        },
        description: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        allows: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                notNull: true,
            }
        },
        category: {
            type: DataTypes.ENUM,
            values: [
                "Spritual",
                "Emotional",
                "Mental",
                "Physical",
            ],
            validate: {
                notNull: true,
            },
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
    }, {
        classMethods: {
            associate: function(models) {
                Workshop.hasMany(models.Session);
                Workshop.hasOne(models.Facilitator);
            }
        }
    });

    return Workshop;
};
