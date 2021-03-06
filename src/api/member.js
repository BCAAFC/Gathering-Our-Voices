'use strict';

var middleware = require("../utils/middleware"),
alert = require("../utils/alert");

var moment = require("moment"),
Promise = require('bluebird');

var EARLYBIRD_DEADLINE = require('../../config/config').deadlines.earlybird;

module.exports = function (db, redis) {
  var router = require("express").Router();

  router.route("/")
  .post(function (req, res) {
    db.Account.findOne({
      where: { id: req.session.account.id },
      include: [
        { model: db.Group, include: [ db.Member, ], },
      ],
    }).then(function (account) {
      // Verify
      if (!account.Group) {
        throw new Error("This account does not have a group declared.");
      }
      if (!req.body.email) { req.body.email = null; }
      if (!req.body.background) { req.body.background = null; }
      if (!req.body.birthDate) { req.body.birthDate = null; }
      else { req.body.birthDate = new Date(req.body.birthDate); }
      if (!req.body.gender) { req.body.gender = null; }
      // Transform the form
      if (req.body.notifications === "Yes") { req.body.notifications = true; } else
      if (req.body.notifications === "No") { req.body.notifications = false; }
      // Determine cost
      if (new Date() < EARLYBIRD_DEADLINE) {
        // Earlybird.
        req.body.ticketType = 'earlybird';
      } else {
        // Regular
        req.body.ticketType = 'regular';
      }
      if (!req.body.allergies) { req.body.allergies = []; }
      if (!req.body.conditions) { req.body.conditions = []; }

      // Create
      return account.Group.createMember(req.body);
    }).then(function (member) {
      res.format({
        'text/html': function () {
          alert.success(req, "Member added.");
          res.redirect('/account/group');
        },
        'default': function () { res.status(200).json(member); },
      });
    }).catch(function (error) {
      console.error(error);
      alert.error(req, error.message); res.redirect('back');
    });
  });

  router.route("/:id")
  .put(middleware.auth, function (req, res) {
    db.Member.findOne({
      where: { id: req.params.id },
    }).then(function (member) {
      // Verify member is in group.
      if (req.session.account.Group.id === member.Group) {
        throw new Error("The member specified is not in your group.");
      }
      // Transform the form
      if (req.body.notifications === "Yes") { req.body.notifications = true; } else
      if (req.body.notifications === "No") { req.body.notifications = false; }
      //
      if (!req.body.email) { req.body.email = null; }
      if (!req.body.birthDate) { req.body.birthDate = null; }
      else { req.body.birthDate = new Date(req.body.birthDate); }
      if (!req.body.gender) { req.body.gender = null; }
      if (!req.body.background) { req.body.background = null; }
      // Update details.
      member.name = req.body.name;
      member.type = req.body.type;
      member.gender = req.body.gender;
      member.background = req.body.background;
      member.birthDate = req.body.birthDate;
      member.phone = req.body.phone;
      member.notifications = req.body.notifications;
      member.email = req.body.email;
      member.contactName = req.body.contactName;
      member.contactPhone = req.body.contactPhone;
      member.contactRelation = req.body.contactRelation;
      member.medicalNumber = req.body.medicalNumber;
      member.allergies = req.body.allergies || [];
      member.conditions = req.body.conditions || [];
      // Admin
      if (req.session.isAdmin) {
        member.ticketType = req.body.ticketType;
      }
      // Save
      return member.save();
    }).then(function (member) {
      res.format({
        'text/html': function () {
          alert.success(req, "Member updated.");
          res.redirect('/account/group');
        },
        'default': function () { res.status(200).json(member); },
      });
    }).catch(function (error) {
      res.format({
        'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
        'default': function () { res.status(401).json({ error: error.message }); },
      });
    });
  });

  router.route("/:id/tags")
  .put(middleware.admin, function (req, res) {
    db.Member.findOne({
      where: { id: req.params.id, },
    }).then(function (member) {
      if (member.tags.indexOf(req.body.add) !== -1) {
        throw new Error("Tag already exists.");
      } else {
        member.tags.push(req.body.add);
        return member.save({fields: ['tags']});
      }
    }).then(function (member) {
      res.status(200).json(member.tags);
    }).catch(function (error) {
      res.status(500).json({ error: error.message });
    });
  })
  .delete(middleware.admin, function (req, res) {
    db.Member.findOne({
      where: { id: req.params.id, },
    }).then(function (member) {
      if (!member) { throw new Error("Member not found."); }
      var idx = member.tags.indexOf(req.body.remove);
      if (idx !== -1) {
        member.tags.splice(idx, 1);
        return member.save({fields: ['tags']});
      } else {
        throw new Error("Tag does not exist.");
      }
    }).then(function (member) {
      res.status(200).json(member.tags);
    }).catch(function (error) {
      res.status(500).json({ error: error.message });
    });
  });

  // We use an `a` elem to do this can it can't be a DELETE
  router.route("/delete/:id")
  .get(middleware.auth, function (req, res) {
    db.Member.findOne({
      where: { id: req.params.id, },
    }).then(function (member) {
      // Error checking.
      if (!member) { throw new Error("Member not found."); }
      if ((!req.session.account.Group || member.GroupId !== req.session.account.Group.id) && !req.session.isAdmin) {
        throw new Error("Member is not in your group.");
      }
      return member.destroy();
    }).then(function (member) {
      res.format({
        'text/html': function () {
          alert.success(req, "Member deleted.");
          res.redirect('/account/group');
        },
        'default': function () { res.status(200).json(member); },
      });
    }).catch(function (error) {
      res.format({
        'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
        'default': function () { res.status(401).json({ error: error.message }); },
      });
    });
  });

  // Members express interest with their email and a secret code we've assigned.
  router.route("/interest")
  .post(function (req, res) {
    db.Member.findOne({
      where: { email: req.body.email, secret: req.body.secret },
    }).then(function (member) {
      if (!member) { throw new Error("Member not found or secret entered incorrectly."); }

      if (req.body.session) {
        return member.addInterest(req.body.session);
      } else {
        throw new Error("No session specified.");
      }
    }).then(function (member) {
      res.format({
        'text/html': function () {
          alert.success(req, "Interest expressed.");
          res.redirect('back');
        },
        'default': function () { res.status(200).json(account); },
      });
    }).catch(function (error) {
      res.format({
        'text/html': function () { alert.error(req, error.message); res.redirect('back'); },
        'default': function () { res.status(401).json({ error: error.message }); },
      });
    });
  });

  // Primary contacts accept or reject interests expressed by members.
  router.route("/:member/interest/accept/:session")
  .get(middleware.auth, function (req, res) {
    Promise.join(
      db.Member.findOne({
        where: { id: req.params.member, },
      }).then(member => {
        if (!member) { throw new Error("Member not found."); }
        if ((!req.session.account.Group || member.GroupId !== req.session.account.Group.id) && !req.session.isAdmin) {
          throw new Error("Member is not in your group.");
        }
        return member;
      }),
      db.Session.findOne({
        where: { id: req.params.session, },
      })
    ).spread((member, session) => {
      // Add the interest as a chosen workshop.
      // Don't (yet) delete it from interests as they may be removed from the workshop.
      return session.register(member);
    }).then(function (member) {
      alert.success(req, "Interest accepted successfully.");
      res.redirect('back');
    }).catch(function (error) {
      alert.error(req, error.message);
      res.redirect('back');
    });
  });

  router.route("/:member/interest/reject/:session")
  .get(middleware.auth, function (req, res) {
    db.Member.findOne({
      where: { id: req.params.member, },
    }).then(member => {
      if (!member) { throw new Error("Member not found."); }
      if ((!req.session.account.Group || member.GroupId !== req.session.account.Group.id) && !req.session.isAdmin) {
        throw new Error("Member is not in your group.");
      }
      member.removeInterest(req.params.session);
      return member;
    }).then(function (member) {
      alert.success(req, "Interest rejected.");
      res.redirect('back');
    }).catch(function (error) {
      alert.error(req, error.message);
      res.redirect('back');
    });
  });

  return router;
};
