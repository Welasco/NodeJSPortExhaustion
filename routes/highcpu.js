var express = require('express');
var router = express.Router();
var os = require('os')
var spawn = require('child_process').spawn;

const reportCount = os.cpus().length
function generateChildReport() {
  var child = spawn('node', ['./routes/highcpuchild.js'], {detached: false});
}

reportnum = 1;
router.get('/', function(req, res, next) {
  res.render('highcpu', { title: 'Express' });
  // var htmlvar = {
  //   response: "Report generated in background"
  // };  
  // if (reportCount => 3) {
  //   var reportloop = reportCount-2;
  //   for (let report = 1; report <= reportloop; report++) {
  //     generateChildReport();
  //   }
  // }
  // for (let index = 1; index < 2147483647; index++) {
  //   reportnum = reportnum * index;
  // }
  // res.status(200).send(htmlvar);
});

module.exports = router;