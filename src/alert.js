module.exports = {
    error: function error(req, message) {
        req.session.alert = {
            type: "danger",
            message: message,
        };
        return;
    },
};
