"use strict";

var EXHIBITOR_COST = 400;

module.exports = function (sequelize, DataTypes) {
    var Exhibitor = sequelize.define("Exhibitor", {
        // Info
        representatives: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            comment: "The primary account controller should be included.",
        },
        categories: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            validate: {
                correctInputs: function (value) {
                    var options = [
                        "Post-Secondary",
                        "Health Organization/Agency",
                        "Federal Agency/Department",
                        "Justice Organization/Agency",
                        "Community Service Organization/Agency",
                        "Arts & Crafts Business",
                        "Youth Group/Organization",
                        "Trades & Technical Training",
                        "Provincial Agency/Department",
                        "Industry",
                        "Media/Communications",
                        "Company/Business",
                        "Volunteer/Community Raffle",
                        "Other",
                    ];
                    var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                    if (valid) {
                        throw new Error("Invalid input.");
                    } else {
                        return;
                    }
                },
            },
        },
        provides: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            validate: {
                correctInputs: function (value) {
                    var options = [
                        "Giveaway items",
                        "Print information",
                        "Membership information",
                        "Raffled item",
                        "Electronic Information",
                        "Other",
                    ];
                    var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                    if (valid) {
                        throw new Error("Invalid input.");
                    } else {
                        return;
                    }
                },
            },
        },
        // Requirements.
        electrical: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        delegateBags: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: "Item for the delegate bags",
        },
        payment: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: [ "Cheque", "Money Order", "Credit Card" ],
        },
        // Status
        paid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        classMethods: {
            associate: function (models) {
                Exhibitor.belongsTo(models.Account);
            },
        },
        getterMethods: {
            cost: function () {
                return EXHIBITOR_COST;
            },
        },
    });

    return Exhibitor;
};