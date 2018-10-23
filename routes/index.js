var express = require('express');
var router = express.Router();
var os = require('os')

/* GET home page. */
router.get('/', function(req, res, next) {
  var hostname = os.hostname();
  var ip = req.ip;
  var ipfw = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var useragent = req.headers['user-agent']

  var htmlvar = {
    hostname: hostname,
    ip: ip,
    ipfw: ipfw,
    useragent: useragent,
    title: 'Express'
  };  
  res.render('index', htmlvar);
});

module.exports = router;
