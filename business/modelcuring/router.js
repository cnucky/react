var router = require('express').Router();

router.use('/modelcuring/', require('./route/modelcuring'));

module.exports = router;