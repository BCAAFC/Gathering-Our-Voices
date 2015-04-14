module.exports = function (env, db) {
    db.sequelize.sync().then(function () {
        db.Page.create({
            path: "/login",
            title: "Login",
            featured: true,
            content: "<form action='/api/account' method='POST'>" +
                    "<input name='email'><br>" +
                    "<input name='password' type='password'><br>" +
                    "<input name='name'><br>" +
                    "<input name='affiliation'><br>" +
                    "<input name='phone'><br>" +
                    "<input name='fax'><br>" +
                    "<input name='address'><br>" +
                    "<input name='city'><br>" +
                    "<input name='province'><br>" +
                    "<input name='postalCode'><br>" +
                    "<input type='submit'><br>" +
                "</form>",
        });
    });
};
