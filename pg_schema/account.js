"use strict";

module.exports = function(sequelize, DataTypes) {
    var Account = sequelize.define("User", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
                notNull: true,
                index: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        affiliation: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        // Phone/Fax
        phone: {
            types: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        fax: {
            types: DataTypes.STRING,
            validate: {},
        },
        // Mailing information.
        address: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        city: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
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
            validate: {
                notNull: true,
            },
        },
        postalCode: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
    }, {
        classMethods: {
            associate: function(models) {
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
