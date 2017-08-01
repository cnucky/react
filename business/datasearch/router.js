var router = require('express').Router();

router.use('/datasearch/', require('./route/datasearch'));

module.exports = router;