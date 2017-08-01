var router = require('express').Router();

router.use('/personcore/', require('./route/personcore'));
router.use('/holographic/', require('./route/holographic'));
router.use('/tag/', require('./route/tag'));


module.exports = router;