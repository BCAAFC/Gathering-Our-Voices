"use strict";

module.exports = function (sequelize, DataTypes) {
    var MemberSession = sequelize.define("MemberSession", {
        // Info
        SessionId: { type: DataTypes.INTEGER,  unique: 'key'},
        MemberId: { type: DataTypes.INTEGER, unique: 'key'},
    }, {
        // Nothing yet
    });

    return MemberSession;
};
