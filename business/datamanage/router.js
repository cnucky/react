var router = require('express').Router();

router.use('/dataimport/', require('../datamanage/route/dataimport'));
router.use('/importbatch/', require('../datamanage/route/importbatch'));
router.use('/datalink/', require('../datamanage/route/dataLink'));
router.use('/udp/', require('../datamanage/route/udp'));
router.use('/smartquery/', require('../datamanage/route/smartquery'));

module.exports = router;