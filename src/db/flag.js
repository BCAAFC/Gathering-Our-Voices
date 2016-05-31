"use strict";

module.exports = function (sequelize, DataTypes) {
    var Flag = sequelize.define("Flag", {
        keyword: {
            type: DataTypes.STRING,
            unique: true,
        },
        value: {
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
    }, {
        hooks: {
            afterCreate: function(flag, opts, fn) {
                Flag.cache[flag.keyword] = flag.value;
                fn(null, flag);
            },
            afterUpdate: function(flag, opts, fn) {
                Flag.cache[flag.keyword] = flag.value;
                fn(null, flag);
            },
        },
        classMethods: {
            lookup: function(keyword) {
                return Flag.cache[keyword];
            },
            cache: function() {
                return Flag.cache;
            }
        }
    });

    Flag.cache = {};
    Flag.findAll().then(function (flags) {
        Flag.cache = flags.reduce(function (acc, flag) {
            acc[flag.keyword] = flag.value;
            return acc;
        }, {});
        console.log("Flags cached.");
        return;
    }).catch(function (e) {
        // Probably a firstrun.
        console.log("No flags detected. If this is a firstrun that's totallly ok.");
        return;
    });

    return Flag;
};
