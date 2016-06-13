'use strict';

var Promise = require("bluebird"),
    fs = require("fs"),
    alert = require("../utils/alert");

module.exports = function (db, redis) {
  var router = require("express").Router();

  router.route("/")
  .get(function (req, res) {
    db.Account.findOne({
      where: { id: req.session.account.id, },
      include: [db.Workshop, db.Exhibitor, db.Group, db.Volunteer],
    }).then(function (account) {
      req.session.account = account;
      res.render("account/index", {
        title: "Account - Index",
        account: account,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
        alert: req.alert,
      });
    }).catch(function (error) {
      alert.error(req, error.message);
      res.redirect("/login");
    });
  });

  router.route("/details")
  .get(function (req, res) {
    db.Account.findOne({
      where: { id: req.session.account.id, },
    }).then(function (account) {
      req.session.account = account;
      account.password = null;
      res.render("account/account", {
        title: "Account - Details",
        account: account,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
        alert: req.alert,
      });
    }).catch(function (error) {
      console.log(error);
      alert.error(req, error.message);
      res.redirect("/login");
    });
  });

  router.route("/payments")
  .get(function (req, res) {
    db.Account.findOne({
      where: { id: req.session.account.id, },
      include: [
        db.Payment,
        {
          model: db.Group,
          include: [
            { model: db.Member, attributes: ['name', 'cost',], },
          ],
        },
        { model: db.Exhibitor, attributes: ['cost'], }
      ],
    }).then(function (account) {
      return [account, account.cost(), account.paid(), (account.Group? account.Group.breakdown() : null)];
    }).spread(function (account, cost, paid, breakdown) {
      req.session.account = account;
      res.render("account/payments", {
        title: "Account - Payments",
        account: account,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
        alert: req.alert,
        cost: cost,
        paid: paid,
        balance: cost - paid,
        breakdown: breakdown,
      });
    }).catch(function (error) {
      console.log(error);
      alert.error(req, error.message);
      res.redirect("/login");
    });
  });

  router.route("/group")
  .get(function (req, res) {
    db.Account.findOne({
      where: { id: req.session.account.id, },
      include: [
        { model: db.Group,
          include: [{
            model: db.Member,
            include: [{
              model: db.Session,
              attributes: [ "id" ]
            }],
          }],
        },
      ],
      order: [ [ db.Group, db.Member, "name", ], ],
    }).then(function (account) {
      var notEnoughChaperones = false;
      if (account.Group) {
        var counts = account.Group.Members.reduce(function (acc, val) {
          acc[val.type] += 1;
          return acc;
        }, {
          "Youth": 0,
          "Young Adult": 0,
          "Chaperone": 0,
          "Young Chaperone": 0,
        });
        var chaps = counts["Young Chaperone"] + counts["Chaperone"];
        notEnoughChaperones = chaps * 5 < counts["Youth"];
      }
      req.session.account = account;
      res.render("account/group", {
        title: "Account - Group",
        account: account,
        admin: req.session.isAdmin,
        flags: db.Flag.cache,
        alert: req.alert,
        notEnoughChaperones: notEnoughChaperones,
      });
    }).catch(function (error) {
      console.log(error);
      alert.error(req, error.message);
      res.redirect("/login");
    });
  });

  router.route("/group/member/:id?")
  .get(function (req, res) {
    Promise.join(
      db.Account.findOne({
        where: { id: req.session.account.id, },
        include: [db.Group],
      }),
      db.Member.findOne({
        where: { id: req.params.id, },
        include: [{
          model: db.Session,
          include: [db.Workshop],
        }, {
          model: db.Session,
          as: 'Interest',
          include: [{
            model: db.Workshop,
            attributes: ['title', 'id'],
          }],
        }],
        order: [ [ db.Session, "start", ], ],
      }),
      function (account, member) {
        if (member && (account.Group.id !== member.GroupId)) {
          throw new Error("Member is not in that group");
        }
        if (member) {
          // Ensure we don't show interests already registered in.
          var sessions = member.Sessions.map(x => x.id);
          var interests = member.Interest.filter(x => {
            return sessions.indexOf(x.id) === -1;
          });
        }

        req.session.account = account;
        res.render("account/member", {
          title: "Account - Member",
          account: req.session.account,
          admin: req.session.isAdmin,
          flags: db.Flag.cache,
          alert: req.alert,
          member: member,
          interests: interests,
        });
      }).catch(function (error) {
        console.log(error);
        alert.error(req, error.message);
        res.redirect("/login");
      });
    });

    router.route("/workshops")
    .get(function (req, res) {
      db.Account.findOne({
        where: { id: req.session.account.id, },
        include: [{
          model: db.Workshop,
          include: [
            { model: db.Session, include: db.Member}
          ]
        }],
      }).then(function (account) {
        req.session.account = account;
        res.render("account/workshops", {
          title: "Account - Workshops",
          account: account,
          admin: req.session.isAdmin,
          flags: db.Flag.cache,
          alert: req.alert,
        });
      }).catch(function (error) {
        alert.error(req, error.message);
        res.redirect("/login");
      });
    });

    router.route("/workshop/:wksp/session/:id?")
    .get(function (req, res) {
      Promise.join(
        db.Account.findOne({
          where: { id: req.session.account.id, },
        }),
        new Promise(function (resolve, reject) {
          if (req.params.id) {
            // Refresh account information.
            return resolve(db.Session.findOne({
              where: { id: req.params.id, },
              include: [db.Member],
            }).then(function (session) {
              return session;
            }));
          } else {
            return resolve(null);
          }
        }),
        function (account, session) {
          req.session.account = account;
          res.render("account/session", {
            title: "Account - Session",
            account: account,
            admin: req.session.isAdmin,
            flags: db.Flag.cache,
            alert: req.alert,
            session: session,
            workshop: req.params.wksp,
          });
        }
      ).catch(function (error) {
        alert.error(req, error.message);
        res.redirect("/account");
      });
    });

    router.route("/workshop/:id?")
    .get(function (req, res) {
      db.Account.findOne({
        where: { id: req.session.account.id, },
        include: [{
          model: db.Workshop,
          include: [
            { model: db.Session, include: db.Member}
          ]
        }],
      }).then(function (account) {
        req.session.account = account;
        var workshop = null;

        // Verify they own this workshop.
        if (req.params.id) {
          var idx = req.session.account.Workshops.map(function (x) { return x.id; }).indexOf(Number(req.params.id));
          if (idx === -1) {
            throw new Error("You do not own this workshop. If this is in mistake please get in touch with us.");
          }
          workshop = req.session.account.Workshops[idx];
        }

        res.render("account/workshop", {
          title: "Account - Workshop",
          account: account,
          admin: req.session.isAdmin,
          flags: db.Flag.cache,
          alert: req.alert,
          workshop: workshop,
          new: (workshop) ? true : false,
        });
      }).catch(function (error) {
        alert.error(req, error.message);
        res.redirect("/login");
      });
    });

    router.route("/exhibitor")
    .get(function (req, res) {
      db.Account.findOne({
        where: { id: req.session.account.id, },
        include: [db.Exhibitor]
      }).then(function (account) {
        req.session.account = account;
        res.render("account/exhibitor", {
          title: "Account - Exhibitor",
          account: account,
          admin: req.session.isAdmin,
          flags: db.Flag.cache,
          alert: req.alert,
        });
      }).catch(function (error) {
        alert.error(req, error.message);
        res.redirect("/login");
      });
    });

    router.route("/volunteer")
    .get(function (req, res) {
      db.Account.findOne({
        where: { id: req.session.account.id, },
        include: [db.Volunteer]
      }).then(function (account) {
        req.session.account = account;
        var schedule;
        if (!account.Volunteer) {
          schedule = db.Volunteer.build({ }).schedule;
        }
        res.render("account/volunteer", {
          title: "Account - Volunteer",
          account: account,
          admin: req.session.isAdmin,
          flags: db.Flag.cache,
          alert: req.alert,
          schedule: schedule, // Used on empty volunteer.
        });
      }).catch(function (error) {
        alert.error(req, error.message);
        res.redirect("/login");
      });
    });

    return router;
  };
