"use strict";

var Promise = require("bluebird");

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
            allowNull: false,
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
        // Admin only.
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
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
        },
        instanceMethods: {
            cost: function () {
                return this.getMembers().then(function (members) {
                    return members.reduce(function (total, member) {
                        return total + member.cost();
                    }, 0);
                });
            },
        },
    });

    return Group;
};
