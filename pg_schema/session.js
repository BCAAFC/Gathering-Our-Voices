"use strict";

module.exports = function (sequelize, DataTypes) {
    var Session = sequelize.define("Session", {
        // Info
        start: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        room: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        venue: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        classMethods: {
            associate: function(models) {
                Session.hasMany(models.Member, { hooks: true });
                Session.belongsTo(models.Workshop);
            },
        },
    });

    return Session;
};
