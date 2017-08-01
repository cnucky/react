var router = require('express').Router();

router.use('/layermanager/', require('./route/layermanager'));

module.exports = router;