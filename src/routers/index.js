module.exports = function (httpd) {
    
    // 404
    httpd.use(function notFoundHandler(req, res) {
        res.status(404);
        console.warn('Path `' + req.originalUrl + '`does not exist.');
        res.send('Path `' + req.originalUrl + '`does not exist.');
    });

    return httpd;
};
