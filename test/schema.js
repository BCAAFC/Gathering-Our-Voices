process.env.DATABASE_URL = "postgres://localhost/test";

var assert = require("assert"),
    chai = require("chai"),
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
    });
});
