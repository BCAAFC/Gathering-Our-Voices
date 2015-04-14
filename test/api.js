process.env.DATABASE_URL = "postgres://localhost/test";

var base = "http://localhost:8080/";

var assert = require("assert"),
    chai = require("chai"),
    Promise = require("bluebird"),
    jar = require("request").jar(),
    request = require("request").defaults({ baseUrl: base,
        jar: jar, json: true }),
    moment = require("moment"),
    server = require("../index"),
    db = require("../src/db/")({ POSTGRES_URL: "postgres://localhost/test" });

var get = Promise.promisify(request.get),
    put = Promise.promisify(request.put),
    post = Promise.promisify(request.post),
    del = Promise.promisify(request.del);

// Init
var expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

// Start
describe("API", function () {
    before("Drop, Sync, & Listen", function () {
        // Drop all tables.
        return db.sequelize.drop().then(function () {
            return db.sequelize.sync();
        });
    });
    describe("Accounts", function () {
        describe("Regular User", function () {
            it("should register an Account", function () {
                var form = {
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
                };
                return post("/api/account", { form: form, }).spread(function (response) {
                    response.statusCode.should.equal(200);
                    response.body.email.should.equal("test@test.ca");
                    response.body.password.should.not.equal("hunter2");
                });
            });

            it("permits retrieval of own account", function () {
                return get("/api/account/1").spread(function (response) {
                    response.statusCode.should.equal(200);
                    response.body.email.should.equal("test@test.ca");
                });
            });

            it("permits modification of own account", function () {
                var form = { city: "Testertown" };
                return put("/api/account/1", { form: form, }).spread(function (response) {
                    response.statusCode.should.equal(200);
                    response.body.email.should.equal("test@test.ca");
                    response.body.city.should.equal("Testertown");
                });
            });

            it("doesn't permit listing all users", function () {
                return get("/api/account/").spread(function (response) {
                    response.statusCode.should.equal(401);
                });
            });

            it("doesn't permit deleting of own account", function () {
                return del("/api/account/1").spread(function (response) {
                    response.statusCode.should.equal(401);
                });
            });

            it("doesn't permit getting of other accounts", function () {
                return get("/api/account/2").spread(function (response) {
                    response.statusCode.should.equal(401);
                });
            });

            it("permits logout", function () {
                return get("/api/account/logout").spread(function (response) {
                    response.statusCode.should.equal(200);
                    return get("/api/account/1"); // Own
                }).spread(function (response) {
                    response.statusCode.should.equal(401);
                });
            });
        });

        describe("Admin User", function () {
            it("registers an admin Account", function () {
                var form = {
                    email: "andrew@hoverbear.org", // Default admin email.
                    password: "hunter2",
                    name: "Admin Mc. Testerton",
                    affiliation: "Testers Inc.",
                    phone: "(123) 123-1234",
                    fax: "(123) 123-12345",
                    address: "123 Tester Way",
                    city: "Testerville",
                    province: "British Columbia",
                    postalCode: "A1B 2C3",
                };
                return post("/api/account", { form: form, }).spread(function (response) {
                    response.statusCode.should.equal(200);
                    response.body.email.should.equal("andrew@hoverbear.org");
                    response.body.password.should.not.equal("hunter2");
                });
            });

            it("permits getting of other accounts", function () {
                return get("/api/account/1").spread(function (response) {
                    response.statusCode.should.equal(200);
                });
            });

            it("permits deleting of accounts", function () {
                return del("/api/account/1").spread(function (response) {
                    response.statusCode.should.equal(200);
                });
            });
        });
    });

    describe("Groups", function () {
        it("fails gracefully when group doesn't exist", function () {
            return get("/api/group/1").spread(function (response) {
                response.statusCode.should.equal(401);
            }).then(function () {
                return put("/api/group/1");
            }).spread(function (response) {
                response.statusCode.should.equal(401);
            });
        });

        it("permits group creation", function () {
            var form = {
                affiliationType: "Friendship Centre",
                youthInCare: 0,
                youthInCareSupport: 0,
            };
            return post("/api/group/", { form: form }).spread(function (response) {
                response.statusCode.should.equal(200);
                response.body.email.should.equal("andrew@hoverbear.org");
                response.body.Group.affiliationType.should.equal("Friendship Centre");
            });
        });

        it("permits request for group information when exists", function () {
            return get("/api/group/1").spread(function (response) {
                response.statusCode.should.equal(200);
                response.body.affiliationType.should.equal("Friendship Centre");
            });
        });

        it("doesn't permit request for group information when wrong group", function () {
            return get("/api/group/2").spread(function (response) {
                response.statusCode.should.equal(401);
            });
        });

        it("permits changing group information", function () {
            var form = {
                affiliationType: "Off-reserve",
            };
            return put("/api/group/1", { form: form }).spread(function (response) {
                response.statusCode.should.equal(200);
                response.body.Group.affiliationType.should.equal("Off-reserve");
            });
        });
    });
});
