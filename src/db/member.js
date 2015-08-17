"use strict";
var Promise = require("bluebird"),
    util = require("../util"),
    moment = require("moment");

var YOUTH_MIN_BIRTH = "2001-03-19";
var YOUTH_MAX_BIRTH = "1997-03-17";

var YOUNG_ADULT_MIN_BIRTH = "1997-03-19";
var YOUNG_ADULT_MAX_BIRTH = "1991-03-17";

var YOUNG_CHAPERONE_MIN_BIRTH = "1995-03-19";
var YOUNG_CHAPERONE_MAX_BIRTH = "1991-03-17";

var CHAPERONE_MIN_BIRTH = "1991-03-19";
var CHAPERONE_MAX_BIRTH = "1891-03-17";

var EARLYBIRD_DEADLINE = new Date("00:00 February 7, 2016");

function beforeHook(member, options) {
    return new Promise(function (resolve, reject) {
        // Should really be lists...
        if (typeof member.allergies == "string") {
            member.allergies = [member.allergies];
        }
        member.allergies = util.eliminateDuplicates(member.allergies);
        if (typeof member.conditions == "string") {
            member.conditions = [member.conditions];
        }
        member.conditions = util.eliminateDuplicates(member.conditions);
        if (typeof member.tags == "string") {
            member.tags = [member.tags];
        }
        member.tags = util.eliminateDuplicates(member.tags);
        // Age
        if (member.type && member.birthDate) {
            var start, end;
            if (member.type === "Youth") {
                end = YOUTH_MIN_BIRTH;
                start = YOUTH_MAX_BIRTH;
            } else if (member.type === "Young Adult") {
                end = YOUNG_ADULT_MIN_BIRTH;
                start = YOUNG_ADULT_MAX_BIRTH;
            } else if (member.type === "Young Chaperone") {
                end = YOUNG_CHAPERONE_MIN_BIRTH;
                start = YOUNG_CHAPERONE_MAX_BIRTH;
            } else if (member.type === "Chaperone") {
                end = CHAPERONE_MIN_BIRTH;
                start = CHAPERONE_MAX_BIRTH;
            }
            if (!moment(member.birthDate).isBetween(start, end)) {
                throw new Error(member.type + " must be born between "+ start +" and " + end);
            }
        }
        // TicketType
        if (member.createdAt < EARLYBIRD_DEADLINE) {
            member.cost = 125;
        }
        // Complete?
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
        return resolve(member);
    });
}

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
                    if (moment(val).isAfter(YOUTH_MIN_BIRTH)) {
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
            allowNull: false,
            default: [],
        },
        conditions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            default: [],
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
            set: function (v) {
                if (v === 125 || v === 175) {
                    return this.setDataValue('cost', v);
                } else { throw new Error("Invalid cost"); }
            },
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
                Member.belongsTo(models.Group, { onDelete: 'CASCADE', });
                Member.belongsToMany(models.Session, { through: "MemberSession", onDelete: 'CASCADE', });
            },
        },
        instanceMethods: {
            checkConflicts: function (target) {
                return this.getSessions().then(function (sessions) {
                    return sessions.some(function (val) {
                        if (target.id === val.id) {
                            throw new Error("Member already in this workshop.");
                        } else if (target.start < val.start && target.end < val.start) {
                            // Starts before, ends before.
                            return false;
                        } else if (target.start > val.end && target.end > val.end) {
                            // Starts after, ends after.
                            return false;
                        } else {
                            throw new Error("Member in conflicting workshop.");
                        }
                    });
                });
            },
        },
        hooks: {
            beforeCreate: beforeHook,
            beforeUpdate: beforeHook,
        },
    });

    return Member;
};
