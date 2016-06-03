'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Info
      start: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      end: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      room: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      venue: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      capacity: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },


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
    return queryInterface.dropTable('Sessions');
  }
};
