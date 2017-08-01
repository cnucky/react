var router = require('express').Router();
router.use('/taskadmingraph/', require('./route/taskadmingraph'));
router.use('/taskadmin', require('./route/taskadmin'));

module.exports = router;