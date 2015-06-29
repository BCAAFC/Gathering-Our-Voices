"use strict";

module.exports = function (sequelize, DataTypes) {
    var cache = {};
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
                cache[flag.keyword] = flag.value;
                fn(null, flag);
            },
            afterUpdate: function(flag, opts, fn) {
                cache[flag.keyword] = flag.value;
                fn(null, flag);
            },
        },
        classMethods: {
            lookup: function(keyword) {
                return cache[keyword];
            },
            cache: function() {
                return cache;
            }
        }
    });

    Flag.findAll().then(function (flags) {
        cache = flags.reduce(function (acc, flag) {
            acc[flag.keyword] = flag.value;
            return acc;
        }, {});
        return;
    });

    return Flag;
};
