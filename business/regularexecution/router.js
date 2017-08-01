var router = require('express').Router();

router.use('/regularexecution/', require('./route/regularexecution'));

module.exports = router;