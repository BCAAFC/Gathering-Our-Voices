"use strict";

module.exports = function (sequelize, DataTypes) {
    var Workshop = sequelize.define("Workshop", {
        // Info
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        allows: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM,
            values: [
                "Spritual",
                "Emotional",
                "Mental",
                "Physical",
            ],
            allowNull: false,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
        },
    }, {
        classMethods: {
            associate: function(models) {
                Workshop.hasMany(models.Session);
                Workshop.belongsTo(models.Facilitator);
            }
        },
    });

    return Workshop;
};
