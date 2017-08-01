var http = require('http');
var router = require('express').Router();
var _ = require('underscore');

router.all('*',  function(req, res) {
	var url = require('url').parse(req.query.url);
	var options = _.assign({}, url);
	var sreq = http.request(options, function(sres) {
		sres.pipe(res);
	});
	sreq.on('error', function(e) {
		res.endj({
			code: -1,
			message: e.message
		})
	});
	if(/POST|PUT/i.test(req.method)) {
		req.pipe(sreq);
	} else {
		sreq.end();
	}
})

module.exports = router;
