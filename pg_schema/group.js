"use strict";

module.exports = function (sequelize, DataTypes) {
    var Group = sequelize.define("Group", {
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
            allowNull: false,
        },
        youthInCareSupport: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
    }, {
        classMethods: {
            associate: function (models) {
                Group.hasMany(models.Member);
                Group.belongsTo(models.Account);
            }
        }
    });

    return Group;
};
