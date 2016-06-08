'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Main
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: [
          "Youth",
          "Young Adult",
          "Chaperone",
          "Young Chaperone",
        ],
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM,
        values: [ 'Male', 'Female', 'Other' ],
        allowNull: true,
      },
      birthDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      background: {
        type: Sequelize.ENUM,
        values: [
          "Status First Nations",
          "Non-status First Nations",
          "Inuit",
          "Registered Métis",
          "Non-registered Métis",
          "Other Indigenous",
          "Non-Aboriginal",
        ],
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notifications: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        }
      },
      // Emergency Info
      contactName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactRelation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contactPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      medicalNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      allergies: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        default: [],
      },
      conditions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        default: [],
      },
      // Private Data.
      complete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      cost: {
        type: Sequelize.INTEGER,
        defaultValue: 175,
        allowNull: false,
      },
      interests: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false,
        defaultValue: [],
        comment: "A list of session IDs the member has expressed interest in.",
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING(80)),
        allowNull: false,
        defaultValue: [],
        comment: "Short tags about the member.",
      },
      secret: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      GroupId: {
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
    return queryInterface.dropTable('Members');
  }
};
