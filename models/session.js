'use strict';
module.exports = function(sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
    // Info
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function (models) {
        Session.belongsToMany(models.Member, { through: "MemberSession", onDelete: 'CASCADE' });
        Session.belongsToMany(models.Member, { as: "Interest", through: "MemberInterest", onDelete: 'CASCADE' });
        Session.belongsTo(models.Workshop, { onDelete: 'CASCADE', });
      },
    },
    instanceMethods: {
      register: function (member) {
        return new Promise((resolve, reject) => {
          this.countMembers()
          .then(memberCount => {
            if (memberCount < this.capacity) {
              return member.checkConflicts(this).then(_ => {
                return resolve(this.addMember(member))
              });
            } else {
              return reject(Error("Session full."));
            }
          })
        });
      },
    }
  });
  return Session;
};
