'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Info
      date: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
      number: {
          type: Sequelize.STRING,
          allowNull: true,
      },
      type: {
          type: Sequelize.ENUM,
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
          type: Sequelize.TEXT,
          allowNull: true,
      },
      AccountId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Payments');
  }
};
