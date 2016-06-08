'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('MemberInterest', {
      MemberId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      SessionId: {
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

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('MemberInterest');
  }
};
