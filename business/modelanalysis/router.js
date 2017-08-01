var router = require('express').Router();

router.use('/modeling/', require('./route/modeling'));
router.use('/collision/', require('./route/collision'));

module.exports = router;