'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Flags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      keyword: {
        type: Sequelize.STRING,
        unique: true,
      },
      value: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(_ => {
      return queryInterface.bulkInsert('Flags', [
        {
          keyword: "groupRegistration",
          value: true,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
        {
          keyword: "memberRegistration",
          value: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
        {
          keyword: "exhibitorRegistration",
          value: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
        {
          keyword: "facilitatorRegistration",
          value: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
        {
          keyword: "volunteerRegistration",
          value: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
        {
          keyword: "workshopSignup",
          value: false,
          createdAt: new Date(Date.now()),
          updatedAt: new Date(Date.now()),
        },
      ]);
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Flags');
  }
};
