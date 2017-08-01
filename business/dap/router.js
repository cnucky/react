var router = require('express').Router();

router.use('/services/', require('./route/visualize'));
router.use('/dapServices/', require('./route/visualize-2-3'));
module.exports = router;