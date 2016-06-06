'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Workshops', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Workshop specifics
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      facilitators: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        comment: "The primary account controller should be included.",
      },
      length: {
        type: Sequelize.ENUM,
        values: [ "1.5 hour", "3 hour", "Full day" ],
        allowNull: false,
      },
      audience: {
        // Can't do ARRAY(ENUM)
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      type: {
        // Can't do ARRAY(ENUM)
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      summary: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      interactionLevel: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      maxCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      minCapacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // Requirements
      mailing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: "Is a mailing required?"
      },
      flipcharts: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      flipchartMarkers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      power: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      projector: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      screen: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      player: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      microphone: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      room: {
        type: Sequelize.ENUM,
        values: [
          "Circle",
          "Conference",
          "Semicircle",
          "Gym",
          "Banquet",
          "Classroom",
          "Dance",
          "Boardroom",
          "Clear",
          "E shape",
          "U shape",
          "Theatre Style",
          "Hollow Square",
        ],
        allowNull: false,
      },
      // Facilitator Specifics
      biography: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // Compensation Specifics
      meals: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      accomodation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      travel: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Requires travel from.",
      },
      honorarium: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Honorarium Amount & Details.",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Applicant written notes.",
      },
      // Stateful Meaning
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "If the workshop has been checked by the team.",
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
        comment: "Short tags about the workshop.",
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
    return queryInterface.dropTable('Workshops');
  }
};
