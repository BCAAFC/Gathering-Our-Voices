"use strict";

module.exports = function (sequelize, DataTypes) {
    var Payment = sequelize.define("Payment", {
        // Info
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        number: {
            type: DataTypes.STRING,
            allowNull: true,
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
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        classMethods: {
            associate: function(models) {
                Payment.belongsTo(models.Account, { onDelete: 'CASCADE', });
            }
        }
    });

    return Payment;
};
