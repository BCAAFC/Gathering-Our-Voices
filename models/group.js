'use strict';

var config = require("../config/config");

var eliminateDuplicates = require("../src/utils/eliminate-duplicates"),
  communication = require("../src/communication");

module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    // Info
    affiliationType: {
      type: DataTypes.ENUM,
      values: [
        "Friendship Centre",
        "Off-reserve School",
        "Off-reserve Community Group",
        "On-reserve School",
        "On-reserve Community Group",
        "MCFD or Delegated Agency",
        "Other",
      ],
      allowNull: false,
    },
    youthInCare: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    youthInCareSupport: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    paymentPlans: {
      type: DataTypes.ENUM,
      values: [
        "Cheque",
        "Money Order",
        "Invoice",
        "Credit Card",
        "Paypal"
      ],
      allowNull: false,
    },
    // Admin only.
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING(80)),
      defaultValue: [],
      comment: "Short tags about the group.",
    }
  }, {
    classMethods: {
      associate: function(models) {
        Group.hasMany(models.Member, {onDelete: 'CASCADE'});
        Group.belongsTo(models.Account);
      },
    },
    instanceMethods: {
      // Returns a hard number.
      cost: function () {
        return this.getMembers({attributes: ['id', 'ticketType'], }).then(function (members) {
          // Get counts of each price.
          var counts = members.reduce(function (acc, member, idx) {
            if (!acc[member.ticketType]) { acc[member.ticketType] = 0; }
            acc[member.ticketType] +=1;
            return acc;
          }, { regular: 0, earlybird: 0 });
          // Find number of free.
          var regularCount = counts['regular'],
              earlybirdCount = counts['earlybird'];
          var free = Math.floor((regularCount + earlybirdCount) / 6);
          // Drop some regulars till we have no more frees, or no more regs.
          while (free > 0 && counts['regular'] > 0) {
            free -= 1;
            counts['regular'] -= 1;
          }
          // Same for early
          while (free > 0 && counts['earlybird'] > 0) {
            free -= 1;
            counts['earlybird'] -= 1;
          }

          return ((counts['earlybird'] || 0)*config.prices.earlybird) + ((counts['regular'] || 0)*config.prices.regular);
        });
      },
      // Returns a tabular description.
      breakdown: function () {
        return this.getMembers({
          attributes: ['name', 'type', 'ticketType' ],
        }).then(function (members) {
          // Get counts of each price.
          var counts = members.reduce(function (acc, member, idx) {
            if (!acc[member.ticketType]) { acc[member.ticketType] = []; }
            acc[member.ticketType].push(member);
            return acc;
          }, { 'regular': [], 'earlybird': [] }); // Init to empty.
          // Find number of free.
          var regularCount = (counts['regular']) ? counts['regular'].length : 0,
              earlybirdCount = (counts['earlybird']) ? counts['earlybird'].length : 0;
          var free = Math.floor((regularCount + earlybirdCount) / 6);
          // Drop some regulars till we have no more frees, or no more regs.
          var idx = 0;
          while (free > 0 && counts['regular'].length > idx) {
            free -= 1;
            // Need to clone it as a plain object because of sequelize getter semantics.
            counts['regular'][idx] = counts['regular'][idx].get({plain: true})
            counts['regular'][idx].cost = 0;
            idx += 1;
          }
          // Same for early
          idx = 0;
          while (free > 0 && counts['earlybird'].length > idx) {
            free -= 1;
            // Need to clone it as a plain object because of sequelize getter semantics.
            counts['earlybird'][idx] = counts['earlybird'][idx].get({plain: true})
            counts['earlybird'][idx].cost = 0;
            idx += 1;
          }
          return (counts['regular'] || []).concat((counts['earlybird'] || []));
        });
      },
    },
    hooks: {
      beforeValidate: function (group, options, fn) {
        if (typeof group.tags == "string") {
          group.tags = [group.tags];
        }
        group.tags = eliminateDuplicates(group.tags);
        fn(null, group);
      },
      afterCreate: function (group) {
        return group.getAccount().then(function (account) {
          return communication.mail({
            to: account.email,
            from: '"GOV Robot" <website-robot@mg.bcaafc.com>',
            cc: "dpreston@bcaafc.com",
            title: "Group Registered!",
            template: "apply_group",
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
  return Group;
};
