  'use strict';
  module.exports = {
    up: function(queryInterface, Sequelize) {
      return queryInterface.createTable('Volunteers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        // CRC
        applied: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer has applied.",
        },
        approved: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer is approved.",
        },
        followUp: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "If the volunteer needs a follow up.",
        },

        // Availability & Schedule
        // This is by day. Yes it's still kind of gross.
        schedule: {
            type: Sequelize.JSON,
            allowNull: false,
        },
        // Emergency Name/number
        emergencyName: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        emergencyPhone: {
            type: Sequelize.TEXT,
            allowNull: false,
        },

        // Tshirt size
        tshirt: {
            type: Sequelize.ENUM,
            values: [
               "Extra Small",
               "Small",
               "Medium",
               "Large",
               "Extra Large",
            ],
            allowNull: false,
        },

        // Previous Volunteer Experience
        previousExperience: {
            type: Sequelize.TEXT,
            allowNull: false,
        },

        // Area you're interested in working in
        interests: {
            type: Sequelize.TEXT,
            allowNull: false,
        },

        // Any other info to know
        notes: {
            type: Sequelize.TEXT,
            allowNull: false,
        },

        // Info
        tags: {
            type: Sequelize.ARRAY(Sequelize.STRING(80)),
            allowNull: false,
            defaultValue: [],
            comment: "Short tags about the volunteer.",
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
      return queryInterface.dropTable('Volunteers');
    }
  };
