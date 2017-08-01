var router = require('express').Router();
router.use('/datafence/', require('./route/datafence'));
router.use('/collision/', require('./route/collision'));
module.exports = router;