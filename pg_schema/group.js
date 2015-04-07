"use strict";

module.exports = function(sequelize, DataTypes) {
    var Group = sequelize.define("Group", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
        affiliationType: {
            type: DataTypes.ENUM,
            values: [
                "Friendship Centre",
                "Off-reserve",
                "On-reserve",
                "MCFD or Delegated Agency",
                "Other",
            ],
        },
        youthInCare: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
            }
        },
        youthInCareSupport: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                notNull: true,
            }
        },
        notes: {
            type: DataTypes.TEXT,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
    }, {
        classMethods: {
            associate: function(models) {
                Group.hasMany(models.Member);
                Group.belongsTo(models.Account);
            }
        }
    });

    return Group;
};
