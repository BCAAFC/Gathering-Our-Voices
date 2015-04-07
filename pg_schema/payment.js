"use strict";

module.exports = function(sequelize, DataTypes) {
    var Payment = sequelize.define("Payment", {
        // Housekeeping
        id: { type: DataTypes.INTEGER, autoincrement: true, primaryKey: true },
        createdAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        updatedAt: { type: DataTypes.DATE, validate: { notNull: true }, },
        // Info
        date: {
            type: DataTypes.DATE,
            validate: {
                notNull: true,
            },
        },
        amount: {
            type: DataTypes.INTEGER,
            validate: {
                notNull: true,
            },
        },
        number: {
            type: DataTypes.STRING,
        },
        type: {
            type: DataTypes.ENUM,
            values: [
                "Cheque",
                "Money Order",
                "Invoice",
                "Credit Card",
                "Paypal",
                "Waived",
            ],
        },
        description: {
            type: DataTypes.TEXT,
        }
    }, {
        classMethods: {
            associate: function(models) {
                Payment.hasOne(models.Account);
            }
        }
    });

    return Payment;
};
