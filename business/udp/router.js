var router = require('express').Router();


router.use('/udp/', require('./route/udp'));


module.exports = router;