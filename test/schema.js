process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
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
            it("should not be null", function (done) {
                should.exist(schemas);
                should.exist(schemas.Account);
                should.exist(schemas.Exhibitor);
                should.exist(schemas.Group);
                should.exist(schemas.Member);
                should.exist(schemas.Payment);
                should.exist(schemas.Session);
                should.exist(schemas.Workshop);
                should.exist(schemas.Facilitator);
                done();
            });
        });
        describe("Account", function () {
            it("should permit registration with all information", function (done) {
                schemas.Account.create({
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
                    done();
                }).catch(function (error) {
                    console.log(error);
                    should.not.exist(error);
                    done();
                });
            });
            it("should complain if information is incomplete", function (done) {
                schemas.Account.create({
                    // Deliberately nothing here.
                }).then(function (account) {
                    should.not.exist(account, "Account should have not existed.");
                    done();
                }).catch(function (error) {
                    should.exist(error, "Error should have existed.");
                    done();
                });
            });
            it("should complain if information is wrong", function (done) {
                schemas.Account.create({
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
                    done();
                }).catch(function (error) {
                    should.exist(error, "Error should have existed.");
                    done();
                });
            });
            it("should be able to be removed", function (done) {
                schemas.Account.create({
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
                    done();
                }).catch(function (error) {
                    should.exist(error, "Account should have been deleted.");
                    done();
                });
            });
        });
    });

    describe("Group", function () {
        it("can be created with all information", function (done) {
            schemas.Group.create({
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.exist(group, "Group should have been created.");
                done();
            }).catch(function (error) {
                should.not.exist(error, "Group should have been created.");
                done();
            });
        });
        it ("cannot be created with lacking information", function (done) {
            schemas.Group.create({
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group, "Group should not have been created.");
                done();
            }).catch(function (error) {
                should.exist(error, "Group should not have been created.");
                done();
            });
        });
        it ("cannot be created with wrong information", function (done) {
            schemas.Group.create({
                affiliationType: "Centre", // Not a valid option.
                youthInCare: 0,
                youthInCareSupport: 0,
                notes: "Blah blah blah.",
                tags: ["Blah", "Blurp", "Bleep"],
            }).then(function (group) {
                should.not.exist(group, "Group should not have been created.");
                done();
            }).catch(function (error) {
                should.exist(error, "Group should not have been created.");
                done();
            });
        });
        it("can be associated", function (done) {
            Promise.join(
                schemas.Group.create({
                    affiliationType: "Friendship Centre",
                    youthInCare: 0,
                    youthInCareSupport: 0,
                    notes: "Blah blah blah.",
                    tags: ["Blah", "Blurp", "Bleep"],
                }),
                schemas.Account.find({ where: { email: "test@test.ca" } }),
                function done(group, account) {
                    return account.setGroup(group);
                }
            ).catch(function (error) {
                should.not.exist(error, "Could not associate Group to Account");
            }).done(function () {
                done();
            });
        });
        it("can find related account", function (done) {
            schemas.Account.find({ where: {  email: "test@test.ca" } }).then(function (account) {
                return account.getGroup();
            }).then(function (group) {
                should.exist(group);
                should.equal(group.affiliationType, "Friendship Centre");
                done();
            }).catch(function (error) {
                should.not.exist(error);
                done();
            });
        });
    });
});
