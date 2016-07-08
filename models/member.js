'use strict';

var config = require("../config/config");

var Promise = require("bluebird"),
  moment = require("moment"),
  eliminateDuplicates = require("../src/utils/eliminate-duplicates"),
  randomWords = require("../src/utils/random-words");

var Member;

module.exports = function(sequelize, DataTypes) {
  Member = sequelize.define('Member', {
    // Main
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      values: [
        "Youth",
        "Young Adult",
        "Chaperone",
        "Young Chaperone",
      ],
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM,
      values: [ 'Male', 'Female', 'Other' ],
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    background: {
      type: DataTypes.ENUM,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      }
    },
    // Emergency Info
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactRelation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    medicalNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allergies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      default: [],
    },
    conditions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      default: [],
    },
    // Private Data.
    complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    ticketType: {
      type: DataTypes.ENUM,
      values: [
        'regular',
        'earlybird',
      ],
      defaultValue: 'regular',
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING(80)),
      allowNull: false,
      defaultValue: [],
      comment: "Short tags about the member.",
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    getterMethods: {
      cost: function () {
        return config.prices[this.getDataValue('ticketType')];
      },
      isRightAge: function () {
        var bracket = Member.birthDateLimits(this.type);
        // Note the ordering of this **does** matter.
        return moment(this.birthDate).isBetween(bracket[1], bracket[0]);
      }
    },
    classMethods: {
      associate: function (models) {
        Member.belongsTo(models.Group, { onDelete: 'CASCADE', });
        Member.belongsToMany(models.Session, { through: "MemberSession", onDelete: 'CASCADE', });
        Member.belongsToMany(models.Session, { as: "Interest", through: "MemberInterest", onDelete: 'CASCADE' });
      },
      birthDateLimits: function (type) {
        return [
          moment(config.dates.start).subtract(config.ages[type].youngest, 'years').toDate(),
          moment(config.dates.start).subtract(config.ages[type].oldest, 'years').toDate(),
        ];
      },
    },
    instanceMethods: {
      checkConflicts: function (target) {
        return this.getSessions().then(function (sessions) {
          return sessions.some(function (val) {
            if (target.id === val.id) {
              throw new Error("Member already in this workshop.");
            } else if (target.start < val.start && target.end < val.start) {
              // Starts before, ends before.
              return false;
            } else if (target.start > val.end && target.end > val.end) {
              // Starts after, ends after.
              return false;
            } else {
              throw new Error("Member in conflicting workshop.");
            }
          });
        });
      },
    },
    hooks: {
      beforeValidate: secretCodeGeneration,
      beforeCreate: beforeHook,
      beforeUpdate: beforeHook,
    },
  });
  return Member;
};

function secretCodeGeneration(member, options) {
  return new Promise(function (resolve, reject) {
    // Secret code.
    if (typeof member.secret !== "string") {
      member.secret = randomWords({ exactly: 3, join: '-' });
    }
    return resolve(member);
  });
}

function beforeHook(member, options) {
  return new Promise(function (resolve, reject) {
    // Should really be lists...
    if (typeof member.allergies == "string") {
      member.allergies = [member.allergies];
    }
    member.allergies = eliminateDuplicates(member.allergies);
    if (typeof member.conditions == "string") {
      member.conditions = [member.conditions];
    }
    member.conditions = eliminateDuplicates(member.conditions);
    if (typeof member.tags == "string") {
      member.tags = [member.tags];
    }
    member.tags = eliminateDuplicates(member.tags);
    // Age
    if (member.type && member.birthDate) {
      if (!member.isRightAge) {
        var limits = Member.birthDateLimits(member.type);
        throw new Error(member.type + " must be born between "+ limits[0] +" and " + limits[1]);
      }
    }
    // TicketType
    if (member.createdAt < config.deadlines.earlybird) {
      member.ticketType = 'earlybird';
    } else if (!member.createdAt && new Date() < config.deadlines.earlybird) {
      member.ticketType = 'earlybird';
    }
    // Complete?
    if (member.name &&
      member.type &&
      member.gender &&
      member.birthDate &&
      member.contactName &&
      member.contactRelation &&
      member.contactPhone &&
      member.medicalNumber)
    {
        member.complete = true;
    } else {
        member.complete = false;
    }

    return resolve(member);
  });
}
