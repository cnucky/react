var router = require('express').Router();

router.use('/dataprocess/', require('./route/dataprocess.js'));
router.use('/conduct/', require('./route/conduct.js'));

module.exports = router;