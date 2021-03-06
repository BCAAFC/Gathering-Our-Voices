'use strict';

var eliminateDuplicates = require("../src/utils/eliminate-duplicates"),
  communication = require("../src/communication");

module.exports = function(sequelize, DataTypes) {
  var Workshop = sequelize.define('Workshop', {
    // Workshop specifics
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facilitators: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      comment: "The primary account controller should be included.",
    },
    length: {
      type: DataTypes.ENUM,
      values: [ "1.5 hour", "3 hour", "Full day" ],
      allowNull: false,
    },
    audience: {
      // Can't do ARRAY(ENUM)
      // Permits: "Youth", "Young Adult", "Young Chaperone", "Chaperone"
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        correctInputs: function (value) {
          var options = ["Youth", "Young Adult", "Young Chaperone", "Chaperone"];
          var valid = value.some(function (v) { return options.indexOf(v) === -1; });
          if (valid) {
            throw new Error("Invalid input.");
          } else {
            return;
          }
        },
      },
    },
    type: {
      // Can't do ARRAY(ENUM)
      // Permits: "Presentation", "Exercise", "Roleplay", "Q/A", "Other"
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        correctInputs: function (value) {
          var options = ["Presentation", "Exercise", "Roleplay", "Q/A", "Other"];
          var valid = value.some(function (v) { return options.indexOf(v) === -1; });
          if (valid) {
            throw new Error("Invalid input.");
          } else {
            return;
          }
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Requirements
    flipcharts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    flipchartMarkers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    power: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    projector: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    screen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    microphone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    room: {
      type: DataTypes.ENUM,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Compensation Specifics
    meals: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    accomodation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    travel: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Requires travel from.",
    },
    honorarium: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Honorarium Amount & Details.",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Applicant written notes.",
    },
    // Stateful Meaning
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If the workshop has been checked by the team.",
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "If the workshop has been approved by the team.",
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING(80)),
      allowNull: false,
      defaultValue: [],
      comment: "Short tags about the workshop.",
    },
  }, {
    classMethods: {
      associate: function(models) {
        Workshop.hasMany(models.Session, {onDelete: 'CASCADE'});
        Workshop.belongsTo(models.Account, { onDelete: 'CASCADE', });
      },
      approved: function () {
        return this.findAll({
          where: { approved: true, },
        });
      },
    },
    instanceMethods: {
      accepts: function (type) {
        return this.audience.indexOf(type) !== -1;
      },
    },
    hooks: {
      beforeValidate: function (workshop, options, fn) {
        if (typeof workshop.facilitators == "string") {
          workshop.type = [workshop.type];
        }
        workshop.facilitators = eliminateDuplicates(workshop.facilitators);
        if (typeof workshop.audience == "string") {
          workshop.audience = [workshop.audience];
        }
        if (typeof workshop.type == "string") {
          workshop.type = [workshop.type];
        }
        if (typeof workshop.tags == "string") {
          workshop.tags = [workshop.tags];
        }
        workshop.tags = eliminateDuplicates(workshop.tags);
        fn(null, workshop);
      },
      afterCreate: function (workshop) {
        return workshop.getAccount().then(function (account) {
          return communication.mail({
            to: account.email,
            from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
            cc: "dpreston@bcaafc.com",
            title: "Facilitator Application Received",
            template: "apply_facilitator",
            variables: {
              name: account.name,
              affilation: account.affilation,
              email: account.email,
            },
          });
        });
      },
    },
  });
  return Workshop;
};
