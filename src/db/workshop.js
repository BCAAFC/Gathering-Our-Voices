"use strict";

module.exports = function (sequelize, DataTypes) {
    var Workshop = sequelize.define("Workshop", {
        // Workshop specifics
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Facilitators: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            comment: "The primary account controller should be included.",
        },
        length: {
            type: DataTypes.ENUM,
            values: [ "1.5 hour", "3 hour", "Full day" ],
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM,
            values: [ "Cultural", "Physical", "Emotional", "Mental" ],
            allowNull: false,
        },
        categoryReason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        audience: {
            // Can't do ARRAY(ENUM)
            // Permits: "Youth", "Young Adult", "Young Chaperone", "Chaperone"
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            validate: {
                correctInputs: function (value) {
                    var options = ["Youth", "Young Adult", "Young Chaperone", "Chaperone"];
                    var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                    if (valid) {
                        throw new Error("Invalid input.");
                    } else {
                        return;
                    }
                },
            },
        },
        type: {
            // Can't do ARRAY(ENUM)
            // Permits: "Presentation", "Exercise", "Roleplay", "Q/A", "Other"
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            validate: {
                correctInputs: function (value) {
                    var options = ["Presentation", "Exercise", "Roleplay", "Q/A", "Other"];
                    var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                    if (valid) {
                        throw new Error("Invalid input.");
                    } else {
                        return;
                    }
                },
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        summary: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        interactionLevel: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Requirements
        mailing: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            comment: "Is a mailing required?"
        },
        flipchart: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        projector: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        screen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        player: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        microphone: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        room: {
            type: DataTypes.ENUM,
            values: [
                "Circle",
                "Semicircle",
                "Gym",
                "Banquet",
                "Classroom",
                "Dance",
                "Boardroom",
                "Clear",
            ],
            allowNull: false,
        },
        // Facilitator Specifics
        biography: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        // Compensation Specifics
        meals: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        accomodation: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        travel: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Requires travel from.",
        },
        honorarium: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Honorarium Amount & Details.",
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "Applicant written notes.",
        },
        // Stateful Meaning
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the workshop has been checked by the team.",
        },
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the workshop has been approved by the team.",
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING(80)),
            allowNull: false,
            defaultValue: [],
            comment: "Short tags about the workshop.",
        }
    }, {
        classMethods: {
            associate: function (models) {
                Workshop.hasMany(models.Session);
                Workshop.belongsTo(models.Account);
            },
            approved: function () {
                return this.findAll({
                    where: { approved: true, },
                });
            },
        },
        instanceMethods: {
            accepts: function (type) {
                return this.audience.indexOf(type) !== -1;
            },
        },
        hooks: {
            beforeValidate: function (workshop, options, fn) {
                if (typeof workshop.audience == "string") {
                    workshop.audience = [workshop.audience];
                }
                if (typeof workshop.type == "string") {
                    workshop.type = [workshop.type];
                }
                if (typeof workshop.tags == "string") {
                    workshop.tags = [workshop.tags];
                }
                fn(null, workshop);
            },
        },
    });

    return Workshop;
};
