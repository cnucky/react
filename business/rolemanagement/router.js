var router = require('express').Router();

router.use('/userrole/', require('./route/userrole'));

module.exports = router;