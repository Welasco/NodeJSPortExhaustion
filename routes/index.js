var express = require('express');
var router = express.Router();
var os = require('os')
//let stringify = require('json-stringify-safe');

/* GET home page. */
router.get('/', function(req, res, next) {
  var hostname = os.hostname();
  var ip = req.ip;
  var ipfw = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var useragent = req.headers['user-agent']
  var environment = process.env.environment || 'Not Set'
  var htmlvar = {
    hostname: hostname,
    ip: ip,
    ipfw: ipfw,
    useragent: useragent,
    title: 'Express',
    environment: environment,
    rawheaders: req.rawHeaders,
    headers: JSON.stringify(req.headers)
  };
  res.render('index', htmlvar);
});

module.exports = router;