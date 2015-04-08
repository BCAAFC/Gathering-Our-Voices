process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
    moment = require("moment"),
    schemas = require("../pg_schema/");

// Init
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

// Start
describe("Schemas", function () {
    before("Drop & Sync", function (done) {
        // Drop all tables.
        schemas.sequelize.drop()
            .then(function () {
                return schemas.sequelize.sync();
            }).done(function () {
                done();
            }).catch(function (error) {
                assert.fail(error, null, "Should have been able to drop & sync.");
                done();
            });
    });

    describe("Account", function () {
        describe("Loading", function () {
            it("should not be null", function () {
                should.exist(schemas);
                should.exist(schemas.Account);
                should.exist(schemas.Exhibitor);
                should.exist(schemas.Group);
                should.exist(schemas.Member);
                should.exist(schemas.Payment);
                should.exist(schemas.Session);
                should.exist(schemas.Workshop);
                should.exist(schemas.Facilitator);
            });
        });
        describe("Account", function () {
            it("should permit registration with all information", function () {
                return schemas.Account.create({
                    email: "test@test.ca",
                    password: "hunter2",
                    name: "Testy Mc. Testerton",
                    affiliation: "Testers Inc.",
                    phone: "(123) 123-1234",
                    fax: "(123) 123-12345",
                    address: "123 Tester Way",
                    city: "Testerville",
                    province: "British Columbia",
                    postalCode: "A1B 2C3",
                }).then(function (account) {
                    should.exist(account, "Account should exist");
                }).catch(function (error) {
                    console.log(error);
                    should.not.exist(error);
                });
            });
            it("should complain if information is incomplete", function () {
                return schemas.Account.create({
                    // Deliberately nothing here.
                }).then(function (account) {
                    should.not.exist(account, "Account should have not existed.");
                }).catch(function (error) {
                    should.exist(error, "Error should have existed.");
                });
            });
            it("should complain if information is wrong", function () {
                return schemas.Account.create({
                    email: "test.test.ca", // Not an email.
                    password: "hunter2",
                    name: "Testy Mc. Testerton",
                    affiliation: "Testers Inc.",
                    phone: "(123) 123-1234",
                    fax: "(123) 123-12345",
                    address: "123 Tester Way",
                    city: "Testerville",
                    province: "British Columbia",
                    postalCode: "A1B 2C3",
                }).then(function (account) {
                    should.not.exist(account, "Account should have not existed.");
                }).catch(function (error) {
                    should.exist(error, "Error should have existed.");
                });
            });
            it("should be able to be removed", function () {
                return schemas.Account.create({
                    email: "delete@test.ca",
                    password: "hunter",
                    name: "Delete Me",
                    affiliation: "Deleters Inc.",
                    phone: "(123) 123-1234",
                    fax: "(123) 123-1234",
                    address: "123 Deleter War",
                    city: "Deleterville",
                    province: "British Columbia",
                    postalCode: "A1B 2C3",
                }).then(function (account) {
                    return account.destroy();
                }).then(function () {
                    return schemas.Account.findOne({ where: { email: "delete@test.ca" }});
                }).then(function (account) {
                    should.not.exist(account, "Account should not have been found.");
                }).catch(function (error) {
                    should.exist(error, "Account should have been deleted.");
                });
            });
        });
    });

    describe("Group", function () {
        it("can be created with all information", function () {
            return schemas.Group.create({
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.exist(group, "Group should have been created.");
            }).catch(function (error) {
                should.not.exist(error, "Group should have been created.");
            });
        });
        it ("cannot be created with lacking information", function () {
            schemas.Group.create({
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group, "Group should not have been created.");
            }).catch(function (error) {
                should.exist(error, "Group should not have been created.");
            });
        });
        it ("cannot be created with wrong information", function () {
            return schemas.Group.create({
                affiliationType: "Centre", // Not a valid option.
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group, "Group should not have been created.");
            }).catch(function (error) {
                should.exist(error, "Group should not have been created.");
            });
        });
        it("can be associated", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca" }
            }).then(function (account) {
                return account.createGroup({
                    affiliationType: "Friendship Centre",
                    youthInCare: 0,
                    youthInCareSupport: 0,
                    notes: "Blah blah blah.",
                    tags: ["Blah", "Blurp", "Bleep"],
                });
            }).catch(function (error) {
                should.not.exist(error, "Could not associate Group to Account");
            });
        });
        it("can find related account", function () {
            return schemas.Account.find({ where: {  email: "test@test.ca" } }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                should.exist(group);
                should.equal(group.affiliationType, "Friendship Centre");
            }).catch(function (error) {
                should.not.exist(error);
            });
        });
    });
    describe("Member", function () {
        it("can be created with minimal information", function () {
            return schemas.Member.create({
                name: "Incomplete Tester",
                type: "Youth",
            }).then(function (member) {
                should.exist(member, "Should have been able to create member.");
                should.equal(member.complete, false, "Should not be complete.");
            });
        });
        it("can be created with full information and marked complete", function () {
            return schemas.Member.create({
                name: "Complete Tester",
                type: "Youth",
                gender: "Male",
                birthDate: moment("1999-01-01").toDate(),
                phone: "(123) 123-1234",
                email: "test@test.ca",
                contactName: "Testy Contact",
                contactRelation: "Relationship",
                contactPhone: "(123) 123-1234",
                medicalNumber: "1234567890",
                allergies: ["Hair", "Bear", "Lice"],
                conditions: ["Tester"],
            }).then(function (member) {
                should.exist(member, "Should have been able to create member.");
                should.equal(member.complete, true, "Member should be complete.");
            });
        });
        it("cannot be created if too young to attend", function () {
            return schemas.Member.create({
                name: "Testy Tester",
                type: "Youth",
                birthDate: moment("2010-01-01").toDate(),
            }).then(function (member) {
                should.not.exist(member, "Should not have been able to create member.");
            }).catch(function (error) {
                should.exist(error, "Should not have been able to create member.");
            });
        });
        it("cannot be created with lacking information", function () {
            return schemas.Member.create({
                name: "Testy Incomplete",
            }).then(function (member) {
                should.not.exist(member, "Should have not been able to create member.");
            }).catch(function (error) {
                should.exist(error, "Should have not been able to create member.");
            });
        });
        it("can be associated with a group", function () {
            return schemas.Account.find({ 
                where: { email: "test@test.ca" },
                include: [ schemas.Group ],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.createMember({
                    name: "Associated Tester",
                    type: "Chaperone",
                });
            }).catch(function (error) {
                should.not.exist(error, "Should have been able to associate.");
            });
        });
        it("can be retrieved after association", function () {
            return schemas.Account.find({
                where: { email: "test@test.ca" },
                include: [{ all: true }],
            }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                return group.getMembers();
            }).then(function (members) {
                should.exist(members[0], "Member should exist.");
            }).catch(function (error) {
                should.not.exist(error, "Should have been able to retrieve member.");
            });
        });
    });
});
