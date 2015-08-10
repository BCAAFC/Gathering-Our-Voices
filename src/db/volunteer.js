"use strict";

function dayScaffold(day) {
    return {
        day: day,
        morning: {
            available: false,
            scheduled: null,
        },
        afternoon: {
            available: false,
            scheduled: null,
        },
        evening: {
            available: false,
            scheduled: null,
        },
    };
}

module.exports = function (sequelize, DataTypes) {
    var Volunteer = sequelize.define("Volunteer", {
        // CRC
        applied: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer has applied.",
        },
        approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer is approved.",
        },
        followUp: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer needs a follow up.",
        },

        // Availability & Schedule
        // This is by day. Yes it's still kind of gross.
        schedule: {
            type: DataTypes.JSON,
            allowNull: false,
            // Easier to iterator over and always in order.
            defaultValue: [
                dayScaffold("Sunday"),
                dayScaffold("Monday"),
                dayScaffold("Tuesday"),
                dayScaffold("Wednesday"),
                dayScaffold("Thursday"),
            ],
        },
        // Emergency Name/number
        emergencyName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        emergencyPhone: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        // Tshirt size
        tshirt: {
            type: DataTypes.ENUM,
            values: [
                "Extra Small",
                "Small",
                "Medium",
                "Large",
                "Extra Large",
            ],
            allowNull: false,
        },

        // Previous Volunteer Experience
        previousExperience: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        // Area you're interested in working in
        interests: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        // Any other info to know
        notes: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        // Info
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING(80)),
            allowNull: false,
            defaultValue: [],
            comment: "Short tags about the volunteer.",
        }
    }, {
        classMethods: {
            associate: function(models) {
                Volunteer.belongsTo(models.Account, { onDelete: 'CASCADE', });
            },
        },
        hooks: {
            beforeValidate: function (volunteer, options, fn) {
                if (typeof volunteer.tags == "string") {
                    volunteer.tags = [volunteer.tags];
                }
                fn(null, volunteer);
            },
        },
    });

    return Volunteer;
};
