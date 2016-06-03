'use strict';
module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
      // Info
      affiliationType: {
          type: DataTypes.ENUM,
          values: [
              "Friendship Centre",
              "Off-reserve",
              "On-reserve",
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
        cost: function () {
            return this.getMembers({attributes: ['cost'], }).then(function (members) {
                // Get counts of each price.
                var counts = members.reduce(function (total, member, idx) {
                    total[member.cost] +=1;
                    return total;
                }, {175: 0, 125: 0});
                // Find number of free.
                var free = Math.floor((counts[175] + counts[125]) / 6);
                // Drop some regulars till we have no more frees, or no more regs.
                while (free > 0 && counts[175] > 0) {
                    free -= 1;
                    counts[175] -= 1;
                }
                // Same for early
                while (free > 0 && counts[125] > 0) {
                    free -= 1;
                    counts[125] -= 1;
                }

                return (counts[125]*125) + (counts[175]*175);
            });
        },
        breakdown: function () {
            return this.getMembers({
                attributes: ['name', 'type', 'cost'],
                raw: true,
            }).then(function (members) {
                // Get counts of each price.
                var counts = members.reduce(function (total, member, idx) {
                    total[member.cost].push(member);
                    return total;
                }, {175: [], 125: []});
                // Find number of free.
                var free = Math.floor((counts[175].length + counts[125].length) / 6);
                // Drop some regulars till we have no more frees, or no more regs.
                var idx = 0;
                while (free > 0 && counts[175].length > idx) {
                    free -= 1;
                    counts[175][idx].cost = 0;
                    idx += 1;
                }
                // Same for early
                idx = 0;
                while (free > 0 && counts[125].length > idx) {
                    free -= 1;
                    counts[125][idx].cost = 0;
                    idx += 1;
                }

                return counts[175].concat(counts[125]);
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
