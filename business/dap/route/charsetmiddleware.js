module.exports = function () {
    return function (req, res, next) {
        res.writeHead(200, { 'Content-Type': "text/json;charset=utf-8" });
        next();
    }
}