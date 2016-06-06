'use strict';

var EXHIBITOR_COST = 400;

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Exhibitors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Info
      representatives: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        comment: "The primary account controller should be included.",
      },
      categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      provides: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      // Requirements.
      electrical: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      delegateBags: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: "Item for the delegate bags",
      },
      cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defautValue: EXHIBITOR_COST,
      },
      payment: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: [ "Cheque", "Money Order", "Credit Card" ],
      },
      // Private
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If the exhibitor has been checked by the team.",
      },
      approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If the workshop has been approved by the team.",
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING(80)),
        allowNull: false,
        defaultValue: [],
        comment: "Short tags about the exhibitor.",
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
    return queryInterface.dropTable('Exhibitors');
  }
};
