var router = require('express').Router();

router.use('/smartquery/', require('./route/smartquery'));

module.exports = router;