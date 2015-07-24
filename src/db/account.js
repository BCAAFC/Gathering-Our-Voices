"use strict";
var bcrypt = require("bcrypt"),
    Promise = require("bluebird"),
    mail = require("../mail").mail;

var compare = Promise.promisify(bcrypt.compare);

// Run when password changes.
var hashPasswordHook = function (account, opts, fn) {
  if (!account.changed('password')) return fn();
  bcrypt.hash(account.get('password'), 10, function (err, hash) {
    if (err) return fn(err);
    account.set('password', hash);
    fn(null, account);
  });
};

module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define("Account", {
        // Info
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            index: true,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        affiliation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Phone/Fax
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fax: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Mailing information.
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        province: {
            type: DataTypes.ENUM,
            values: [
                "British Columbia",
                "Alberta",
                "Saskatchewan",
                "Manitoba",
                "Ontario",
                "Quebec",
                "New Brunswick",
                "Nova Scotia",
                "Prince Edward Island",
                "Newfoundland and Labrador",
                "Nunavut",
                "Northwest Territories",
                "Yukon",
                "Other (Outside Canada)",
            ],
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },
        misc: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
        },
    }, {
        classMethods: {
            associate: function (models) {
                Account.hasOne(models.Group);
                Account.hasOne(models.Exhibitor);
                Account.hasOne(models.Volunteer);
                Account.hasOne(models.Workshop);
                Account.hasMany(models.Payment);
            },
            auth: function (email, pass) {
                return Account.findOne({
                    where: { email: email },
                    include: [{ all: true, nested: true }],
                }).then(function (account) {
                    if (account) {
                        return [account, account.passwordValid(pass)];
                    } else {
                        throw new Error("No user found.");
                    }
                }).spread(function (account, valid) {
                    if (valid === true) {
                        return account;
                    } else {
                        throw new Error("Invalid password.");
                    }
                });
            }
        },
        instanceMethods: {
            cost: function () {
                return Promise.join(
                    this.getGroup().then(function (group) {
                        return group? group.cost() : 0;
                    }),
                    this.getExhibitor().then(function (exhibitor) {
                        return exhibitor? exhibitor.cost : 0;
                    }),
                    function done(group, exhibitor) {
                        return group + exhibitor;
                });
            },
            paid: function () {
                return this.getPayments().reduce(function (total, payment) {
                    return total + payment.amount;
                }, 0);
            },
            balance: function () {
                return Promise.join(
                    this.cost(),
                    this.paid(),
                    function done(cost, payments) {
                        return cost + payments;
                });
            },
            passwordValid: function (attempt) {
                return compare(attempt, this.password);
            },
            recoveryStart: function () {
                var self = this;
                self.misc.recovery = Math.random().toString(36).slice(2);
                return mail(
                    [{ email: self.email, name: self.organization, }],
                    [],
                    "Account Recovery",
                    "recovery",
                    [
                        { name: "email", content: encodeURIComponent(self.email), },
                        { name: "key", content: encodeURIComponent(self.misc.recovery), },
                    ]
                ).then(function () {
                   return self.save({fields: ['misc']});
                });
           },
           recoveryFinish: function (key) {
               if (this.misc.recovery === key) {
                   return this;
               } else {
                   throw new Error("Invalid recovery key.");
               }
           },
        },
        hooks: {
            beforeCreate: hashPasswordHook,
            beforeUpdate: hashPasswordHook,
            afterCreate: function (account) {
                return mail(
                    [{ email: account.email, name: account.affiliation, }], // To
                    [{ email: "dpreston@bcaafc.com", name: "Della Preston", }], // CC
                    "Registration Confirmation",
                    "registration",
                    [
                        { name: "name", content: account.name, },
                        { name: "affilation", content: account.affilation, },
                    ]
                );
            },
        }
    });

    return Account;
};
