'use strict';

var eliminateDuplicates = require('../src/utils/eliminate-duplicates'),
    communication = require('../src/communication');

module.exports = function(sequelize, DataTypes) {
  var Volunteer = sequelize.define('Volunteer', {
    // CRC
    applied: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If the volunteer has applied.",
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If the volunteer is approved.",
    },
    followUp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If the volunteer needs a follow up.",
    },

    // Availability & Schedule
    // Day 0 is the day **before** opening ceremonies.
    dayZeroMorning:   { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayZeroAfternoon: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayZeroEvening:   { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    // Day 1 is the day of OC / Registration
    dayOneMorning:    { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayOneAfternoon:  { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayOneEvening:    { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    // Day 2 is the first day of workshops
    dayTwoMorning:    { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayTwoAfternoon:  { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayTwoEvening:    { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    // Day 3 is the second day of workshops
    dayThreeMorning:  { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayThreeAfternoon: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayThreeEvening:  { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    // Day 4 is the closing day.
    dayFourMorning:   { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayFourAfternoon: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },
    dayFourEvening:   { type: DataTypes.TEXT, allowNull: true, defaultValue: null, },


    // Emergency Name/number
    emergencyName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    emergencyPhone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Tshirt size
    tshirt: {
      type: DataTypes.ENUM,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Area you're interested in working in
    interests: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Any other info to know
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Info
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING(80)),
      allowNull: false,
      defaultValue: [],
      comment: "Short tags about the volunteer.",
    },
  }, {
    classMethods: {
      associate: function(models) {
        Volunteer.belongsTo(models.Account, { onDelete: 'CASCADE', });
      }
    },
    hooks: {
      beforeValidate: function (volunteer, options, fn) {
        if (typeof volunteer.tags == "string") {
          volunteer.tags = [volunteer.tags];
        }
        volunteer.tags = eliminateDuplicates(volunteer.tags);
        fn(null, volunteer);
      },
      afterCreate: function (volunteer) {
        return volunteer.getAccount().then(function (account) {
          return communication.mail({
            to: account.email,
            from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
            cc: "dpreston@bcaafc.com",
            title: "Volunteer Application Recieved",
            template: "apply_volunteer",
            variables: {
              name: account.name,
              affilation: account.affilation,
              email: account.email,
              id: volunteer.id,
            },
          });
        });
      },
    },
  });
  return Volunteer;
};
