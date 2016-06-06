'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      path: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
      title: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      content: {
          type: Sequelize.TEXT,
          allowNull: false,
      },
      rollback: {
          type: Sequelize.TEXT,
          allowNull: true,
      },
      requirements: {
          type: Sequelize.ENUM,
          values: [ "Normal", "Authenticated", "Administrator" ],
          defaultValue: "Normal",
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
    return queryInterface.dropTable('Pages');
  }
};
