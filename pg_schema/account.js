"use strict";
var bcrypt = require("bcrypt");

module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define("Account", {
        // Info
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            index: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.VIRTUAL,
            set: function (val) {
                // TODO: Not sync?
                var hash = bcrypt.hashSync(val, 10);
                this.setDataValue('password_hash', hash);
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        affiliation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Phone/Fax
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fax: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Mailing information.
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        province: {
            type: DataTypes.ENUM,
            values: [
                "British Columbia",
                "Alberta",
                "Saskatchewan",
                "Manitoba",
                "Ontario",
                "Quebec",
                "New Brunswick",
                "Nova Scotia",
                "Prince Edward Island",
                "Newfoundland and Labrador",
                "Nunavut",
                "Northwest Territories",
                "Yukon",
                "Other (Outside Canada)",
            ],
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        classMethods: {
            associate: function (models) {
                Account.hasOne(models.Group);
                Account.hasOne(models.Facilitator);
                Account.hasOne(models.Exhibitor);
                Account.hasOne(models.Volunteer);
                Account.hasMany(models.Payment);
            }
        }
    });

    return Account;
};
