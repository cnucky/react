var router = require('express').Router();

router.use('/relationgraph/', require('./route/relationgraph'));

module.exports = router;