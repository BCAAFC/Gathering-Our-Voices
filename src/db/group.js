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
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING(80)),
            allowNull: false,
            defaultValue: [],
            comment: "Short tags about the group.",
        }
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
        hooks: {
            beforeValidate: function (group, options, fn) {
                if (typeof group.tags == "string") {
                    group.tags = [group.tags];
                }
                fn(null, group);
            },
        },
    });

    return Group;
};
