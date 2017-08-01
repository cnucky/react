var router = require('express').Router();

router.use('/tag/', require('./route/tag'));

module.exports = router;