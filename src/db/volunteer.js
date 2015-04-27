"use strict";

module.exports = function (sequelize, DataTypes) {
    var Volunteer = sequelize.define("Volunteer", {
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
                Volunteer.belongsTo(models.Account);
            }
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
