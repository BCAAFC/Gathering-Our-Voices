"use strict";

module.exports = function (sequelize, DataTypes) {
    var Workshop = sequelize.define("Workshop", {
        // Workshop specifics
        title: {
            type: DataTypes.STRING,
            allowNull: false,
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
            type: DataTypes.TEXT,
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
            type: DataTypes.INTEGER,
            allowNull: false,
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
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the workshop has been approved by the team.",
        },
    }, {
        classMethods: {
            associate: function (models) {
                Workshop.hasMany(models.Session);
                Workshop.belongsTo(models.Account);
            }
        },
        instanceMethods: {
            accepts: function(type) {
                return this.audience.indexOf(type) !== -1;
            },
        },
    });

    return Workshop;
};
