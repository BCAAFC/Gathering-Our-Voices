'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Info
      affiliationType: {
        type: Sequelize.ENUM,
        values: [
          "Friendship Centre",
          "Off-reserve",
          "On-reserve",
          "MCFD or Delegated Agency",
          "Other",
        ],
        allowNull: false,
      },
      youthInCare: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      youthInCareSupport: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      paymentPlans: {
        type: Sequelize.ENUM,
        values: [
          "Cheque",
          "Money Order",
          "Invoice",
          "Credit Card",
          "Paypal"
        ],
        allowNull: false,
      },
      // Admin only.
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING(80)),
        defaultValue: [],
        comment: "Short tags about the group.",
      },
      //
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Groups');
  }
};
