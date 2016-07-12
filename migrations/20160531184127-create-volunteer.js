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
        // Availability & Schedule
        // Day 0 is the day **before** opening ceremonies.
        dayZeroMorning:   { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayZeroAfternoon: { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayZeroEvening:   { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        // Day 1 is the day of OC / Registration
        dayOneMorning:    { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayOneAfternoon:  { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayOneEvening:    { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        // Day 2 is the first day of workshops
        dayTwoMorning:    { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayTwoAfternoon:  { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayTwoEvening:    { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        // Day 3 is the second day of workshops
        dayThreeMorning:  { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayThreeAfternoon: { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayThreeEvening:  { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        // Day 4 is the closing day.
        dayFourMorning:   { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayFourAfternoon: { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },
        dayFourEvening:   { type: Sequelize.TEXT, allowNull: true, defaultValue: null, },


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
