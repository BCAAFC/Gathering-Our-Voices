"use strict";

module.exports = function (sequelize, DataTypes) {
    var Member = sequelize.define("Member", {
        // Main
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM,
            values: [
                "Youth",
                "Young Adult",
                "Chaperone",
                "Young Chaperone",
            ],
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM,
            values: [ 'Male', 'Female', 'Other' ],
            allowNull: true,
        },
        birthdate: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                // TODO: Age validation.
            },
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            }
        },
        // Emergency Info
        contactName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactRelation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        medicalNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        allergies: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        conditions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
        // Private Data.
        complete: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        ticketType: {
            type: DataTypes.ENUM,
            values: [ "Early", "Regular", ],
            defaultValue: "Regular",
            allowNull: false,
        },
    }, {
        classMethods: {
            associate: function(models) {
                Member.belongsTo(models.Group);
                Member.belongsToMany(models.Session, { through: "Sessions" });
            }
        }
    });

    return Member;
};
