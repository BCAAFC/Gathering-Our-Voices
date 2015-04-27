"use strict";

var moment = require("moment");

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
        birthDate: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                // TODO: More age validation.
                tooYoung: function (val) {
                    if (moment(val).isAfter("2001-03-18")) {
                        throw new Error("Member too young to attend the conference.");
                    }
                },
            },
        },
        background: {
            type: DataTypes.ENUM,
            values: [
                "Status First Nations",
                "Non-status First Nations",
                "Inuit",
                "Registered Métis",
                "Non-registered Métis",
                "Other Indigenous",
                "Non-Aboriginal",
            ],
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notifications: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
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
        cost: {
            type: DataTypes.INTEGER,
            defaultValue: 175,
            allowNull: false,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING(80)),
            allowNull: false,
            defaultValue: [],
            comment: "Short tags about the member.",
        }
    }, {
        classMethods: {
            associate: function (models) {
                Member.belongsTo(models.Group);
                Member.belongsToMany(models.Session, { through: "MemberSession" });
            },
        },
        hooks: {
            beforeValidate: function (member, options, fn) {
                if (typeof member.allergies == "string") {
                    member.allergies = [member.allergies];
                }
                if (typeof member.conditions == "string") {
                    member.conditions = [member.conditions];
                }
                if (typeof member.tags == "string") {
                    member.tags = [member.tags];
                }
                fn(null, member);
            },
            afterValidate: function (member, options, fn) {
                if (member.name &&
                    member.type &&
                    member.gender &&
                    member.birthDate &&
                    member.contactName &&
                    member.contactRelation &&
                    member.contactPhone &&
                    member.medicalNumber)
                {
                    member.complete = true;
                } else {
                    member.complete = false;
                }
                fn(null, member);
            },
        },
    });

    return Member;
};
