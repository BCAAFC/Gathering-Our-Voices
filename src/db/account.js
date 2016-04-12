"use strict";
var bcrypt = require("bcrypt"),
    Promise = require("bluebird"),
    communication = require("../communication");

var compare = Promise.promisify(bcrypt.compare);

var updateHook = function (account, opts, fn) {
    // Run when password changes.
    if (!account.changed('password')) return fn();
    bcrypt.hash(account.get('password'), 10, function (err, hash) {
        if (err) return fn(err);
        account.set('password', hash);
        fn(null, account);
    });
    account.set("email", account.get("email").toLowerCase());
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
                // All things associated with an account should delete when it is.
                Account.hasOne(models.Group, {onDelete: 'CASCADE'});
                Account.hasOne(models.Exhibitor, {onDelete: 'CASCADE'});
                Account.hasOne(models.Volunteer, {onDelete: 'CASCADE'});
                // Account.hasOne(models.Workshop, {onDelete: 'CASCADE'});
                Account.hasMany(models.Workshop, {onDelete: 'CASCADE'});
                Account.hasMany(models.Payment, {onDelete: 'CASCADE'});
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
                        return group ? group.cost() : 0;
                    }),
                    this.getExhibitor({ attributes: ['cost'], }).then(function (exhibitor) {
                        return exhibitor ? exhibitor.cost : 0;
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
                        return cost - payments;
                });
            },
            passwordValid: function (attempt) {
                return compare(attempt, this.password);
            },
            recoveryStart: function () {
                var self = this;
                return self.update({
                    misc: { recovery: Math.random().toString(36).slice(2), }
                }).then(function (self) {
                    return communication.mail({
                        to: self.email,
                        from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
                        title: "Account Recovery",
                        template: "recovery",
                        variables: {
                            email: encodeURIComponent(self.email),
                            key: encodeURIComponent(self.misc.recovery),
                        }
                    });
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
            beforeCreate: updateHook,
            beforeUpdate: updateHook,
            afterCreate: function (account) {
                return communication.mail({
                    to: account.email,
                    from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
                    title: "Registration Confirmation",
                    template: "registration",
                    variables: {
                        name: account.name,
                        affilation: account.affilation,
                        email: account.email,
                    },
                });
            },
        },
    });

    return Account;
};
