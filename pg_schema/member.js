"use strict";

module.exports = function(sequelize, DataTypes) {
    var Member = sequelize.define("Member", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Main
        name: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        type: {
            type: DataTypes.ENUM,
            values: [
                "Youth",
                "Young Adult",
                "Chaperone",
                "Young Chaperone",
            ],
            validate: {
                notNull: true,
            },
        },
        gender: {
            type: DataTypes.ENUM,
            values: [ 'Male', 'Female', 'Other' ],
            validate: {},
        },
        birthdate: {
            type: DataTypes.DATE,
            validate: {
                // TODO: Age validation.
            },
        },
        phone: { type: DataTypes.STRING, },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            }
        },
        // Emergency Info
        contactName: { type: DataTypes.STRING, },
        contactRelation: { type: DataTypes.STRING, },
        contactPhone: { type: DataTypes.STRING, },
        medicalNumber: { type: DataTypes.STRING, },
        allergies: { type: DataTypes.ARRAY(DataTypes.STRING), },
        conditions: { type: DataTypes.ARRAY(DataTypes.STRING), },
        // Private Data.
        complete: { type: DataTypes.BOOLEAN, },
        ticketType: {
            type: DataTypes.ENUM,
            values: [ "Early", "Regular", ]
        },
    }, {
        classMethods: {
            associate: function(models) {
                Member.belongsTo(models.Group);
                Member.hasMany(models.Workshop);
            }
        }
    });

    return Member;
};
