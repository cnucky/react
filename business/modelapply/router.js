var router = require('express').Router();

router.use('/modelapply/', require('./route/modelapply'));

module.exports = router;