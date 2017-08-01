var router = require('express').Router();
var charsetMiddleware = require('./route/charsetmiddleware');

router.use('/lmbservice/', charsetMiddleware(), require('./route/lmb-taishi'));

module.exports = router;