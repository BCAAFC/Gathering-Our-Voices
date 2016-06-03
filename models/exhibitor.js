'use strict';

var communication = require("../src/communication"),
    eliminateDuplicates = require("../src/utils/eliminate-duplicates");

var EXHIBITOR_COST = 400;

module.exports = function(sequelize, DataTypes) {
  var Exhibitor = sequelize.define('Exhibitor', {
      // Info
      representatives: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
          comment: "The primary account controller should be included.",
      },
      categories: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
          validate: {
              correctInputs: function (value) {
                  var options = [
                      "Post-Secondary",
                      "Health Organization/Agency",
                      "Federal Agency/Department",
                      "Justice Organization/Agency",
                      "Community Service Organization/Agency",
                      "Arts & Crafts Business",
                      "Youth Group/Organization",
                      "Trades & Technical Training",
                      "Provincial Agency/Department",
                      "Industry",
                      "Media/Communications",
                      "Company/Business",
                      "Volunteer/Community Raffle",
                      "Other",
                  ];
                  var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                  if (valid) {
                      throw new Error("Invalid input.");
                  } else {
                      return;
                  }
              },
          },
      },
      provides: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
          validate: {
              correctInputs: function (value) {
                  var options = [
                      "Giveaway items",
                      "Print information",
                      "Membership information",
                      "Raffled item",
                      "Electronic Information",
                      "Other",
                  ];
                  var valid = value.some(function (v) { return options.indexOf(v) === -1; });
                  if (valid) {
                      throw new Error("Invalid input.");
                  } else {
                      return;
                  }
              },
          },
      },
      // Requirements.
      electrical: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
      },
      delegateBags: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          comment: "Item for the delegate bags",
      },
      cost: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defautValue: EXHIBITOR_COST,
      },
      payment: {
          type: DataTypes.ENUM,
          allowNull: false,
          values: [ "Cheque", "Money Order", "Credit Card" ],
      },
      // Private
      verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "If the exhibitor has been checked by the team.",
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
          comment: "Short tags about the exhibitor.",
      }
  }, {
    classMethods: {
      associate: function(models) {
        Exhibitor.belongsTo(models.Account, { onDelete: 'CASCADE', });
      },
      hooks: {
          beforeValidate: function (exhibitor, options, fn) {
              if (typeof exhibitor.representatives == "string") {
                  exhibitor.representatives = [exhibitor.representatives];
              }
              exhibitor.representatives = eliminateDuplicates(exhibitor.representatives);
              if (typeof exhibitor.categories == "string") {
                  exhibitor.categories = [exhibitor.categories];
              }
              if (typeof exhibitor.provides == "string") {
                  exhibitor.provides = [exhibitor.provides];
              }
              if (typeof exhibitor.tags == "string") {
                  exhibitor.tags = [exhibitor.tags];
              }
              exhibitor.tags = eliminateDuplicates(exhibitor.tags);
              fn(null, exhibitor);
          },
          afterCreate: function (exhibitor) {
              return exhibitor.getAccount().then(function (account) {
                  return communication.mail({
                      to: account.email,
                      from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
                      cc: "dpreston@bcaafc.com",
                      title: "Exhibitor Application Recieved",
                      template: "apply_exhibitor",
                      variables: {
                          name: account.name,
                          affilation: account.affilation,
                          email: account.email,
                      },
                  });
              });
          },
      },
    }
  });
  return Exhibitor;
};
