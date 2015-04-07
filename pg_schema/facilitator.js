"use strict";

module.exports = function(sequelize, DataTypes) {
    var Facilitator = sequelize.define("User", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Workshop specifics
        title: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
        },
        length: {
            type: DataTypes.ENUM,
            values: [ "1.5 hour", "3 hour", "Full day" ],
            validate: {
                notNull: true,
            },
        },
        category: {
            type: DataTypes.ENUM,
            values: [ "Cultural", "Physical", "Emotional", "Mental" ],
            validate: {
                notNull: true,
            },
        },
        categoryReason: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        audience: {
            // Can't do ARRAY(ENUM)
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                notNull: true,
            },
        },
        type: {
            // Can't do ARRAY(ENUM)
            type: DataTypes.ARRAY(DataTypes.STRING),
            validate: {
                notNull: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        summary: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        interactionLevel: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        capacity: {
            type: DataTypes.INTEGER,
            validate: {
                notNull: true,
            },
        },
        // Requirements
        mailing: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
            comment: "Is a mailing requred?"
        },
        flipchart: {
            type: DataTypes.INTEGER,
            validate: {
                notNull: true,
            },
        },
        projector: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
        },
        screen: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
        },
        player: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
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
        },
        // Facilitator Specifics
        biography: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
        },
        // Compensation Specifics
        meals: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
        },
        accomodation: {
            type: DataTypes.BOOLEAN,
            validate: {
                notNull: true,
            },
        },
        travel: {
            type: DataTypes.STRING,
            validate: {
                notNull: true,
            },
            comment: "Requires travel from.",
        },
        honorarium: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
            comment: "Honorarium Amount & Details.",
        },
        notes: {
            type: DataTypes.TEXT,
            validate: {
                notNull: true,
            },
            comment: "Applicant written notes.",
        },
        //
        classMethods: {
            associate: function(models) {
                Facilitator.hasOne(models.Workshop);
                Facilitator.belongsTo(models.Account);
            }
        }
    });

    return Facilitator;
};
