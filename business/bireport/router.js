var router = require('express').Router();

router.use('/bireport/', require('./route/bireport'));

module.exports = router;