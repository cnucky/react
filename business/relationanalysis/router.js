var router = require('express').Router();

router.use('/personcore/', require('./route/personcore'));
router.use('/relationgraph/', require('./route/relationgraph'));
router.use('/personrelationexplore/', require('./route/personrelationexplore'));

module.exports = router;