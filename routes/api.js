var express = require('express');
var router = express.Router();
const Ajv = require('ajv');
const ajv = Ajv({ allErrors:true, removeAdditional:'all' });
var nconf = require('nconf');
var spawn = require('child_process').spawn;
var os = require('os')
var netstat = require('./../tools/netstat');
var webpaicall = require('./../tools/webapicall');
var socketcmd = require('./../models/socketcmd');
var socketstatus = require('./../models/socketstatus');

nconf.file({ file: '././tools/childstatus.json' });
nconf.set('pid', null);
nconf.save();

ajv.addSchema(socketcmd.jsonschema_cmd,'jsonschema_cmd');

function startChildProcess(cmd) {
  //var child = spawn('node', ['./../tcpportexhaustion.js', cmd.Host, cmd.Port, cmd.Connections], {detached: true});
  //var child = spawn('node', ['./../tools/tcpportexhaustion.js', cmd.Host, cmd.Port, cmd.Connections], {detached: false, shell: true});
  //var child = spawn('node', ['././tools/tcpportexhaustion.js', cmd.Host, cmd.Port, cmd.Connections], {detached: false, shell: true});
  var child = spawn('node', ['././tools/tcpportexhaustion.js', cmd.Host, cmd.Port, cmd.Connections], {detached: true});
  
  child.stdout.on('data', (data) => {
    console.log(`child stdout:\n${data}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`child stderr:\n${data}`);
  });  

  nconf.set('pid', child.pid);
  nconf.save();
  return child.pid;    
}

/* GET API home page. */
router.get('/', function(req, res, next) {
  res.send('API');
});

router.get('/Socket', function(req, res, next) {
    var currentPid = nconf.get('pid');
    if (currentPid != null && currentPid != "") {
      let isRunning = netstat.checkNetPid(currentPid);
      if (isRunning) {
        let Sstatus = socketstatus.GetSocketstatus(currentPid);
        res.send(Sstatus); 
        res.end(); 
      } 
      else{
        let Sstatus = socketstatus.Socketstatus;

        res.send(Sstatus); 
        res.end();       
      }  
    }
    else{
      socketstatus.Clean();
      let Sstatus = socketstatus.Socketstatus;
      res.send(Sstatus); 
      res.end();        
    }
});

router.post('/Socket/Start', function(req, res, next) {
  var cmd = req.body;
  let json_validate = ajv.validate(socketcmd.jsonschema_cmd, req.body)
  if (json_validate) {
    var currentPid = nconf.get('pid');
    if (!currentPid != null && !currentPid != "") {
      let isRunning = netstat.checkNetPid(currentPid);
      if (!isRunning) {
        //var child = spawn('node', ['././tools/tcpportexhaustion.js', cmd.target, cmd.port, cmd.connections], {detached: true});
        //nconf.set('pid', child.pid);
        //nconf.save();            
        var cpid = startChildProcess(cmd);
        let Sstatus = socketstatus.GetSocketstatus(cpid);

        res.send(Sstatus); 
        res.end(); 
      } 
      else{
        let Sstatus = socketstatus.Socketstatus;
        res.send(Sstatus); 
        res.end();       
      }  
    }
    else{
      
      nconf.set('pid', null);
      nconf.save();
      
      var cpid = startChildProcess(cmd);
      let Sstatus = socketstatus.GetSocketstatus(cpid);      
      res.send(Sstatus); 
      res.end();        
    }
  }
  else{
    res.status(400);
    res.send("Invalid Command"); 
    res.end(); 
  }
});

router.get('/Socket/Stop', function(req, res, next) {

  var currentPid = nconf.get('pid');
  if (currentPid != null && currentPid != "") {
    process.kill(currentPid);
    nconf.set('pid', null);
    nconf.save();   
  }
  socketstatus.Clean();
  let Sstatus = socketstatus.Socketstatus;
  res.send(Sstatus); 
  res.end();    
});

router.get('/backend', function(req, res, next) {
  function callbackapi(responsedata) {
    let data = JSON.parse(responsedata)
    console.log("Log in callbackapi: " + data);

    res.send(data);
    res.end();    
  }
  webpaicall.webapicall('get', process.env.backend, process.env.backendport, '/api/backendapi', callbackapi)
});

router.get('/backendapi', function(req, res, next) {
  var hostname = os.hostname();
  var ip = req.ip;
  var ipfw = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var useragent = req.headers['user-agent']

  var htmlvar = {
    hostname: hostname,
    ip: ip,
    ipfw: ipfw,
    useragent: useragent,
    backenddatetime: new Date()
  };

  res.send(htmlvar);
  res.end();
});

//
// Allocate a certain size of memory to test if it can be done.
//
function alloc (size) {
  const numbers = size / 8;
  const arr = []
  arr.length = numbers; // Simulate allocation of 'size' bytes.
  for (let i = 0; i < numbers; i++) {
      arr[i] = i;
  }
  return arr;
};


const allocations = []; 
router.get('/memoryexhaustion', function(req, res, next) {
  let allocationStep = 100000 * 1024;

  const allocation = alloc(allocationStep);
  allocations.push(allocation);

  const mu = process.memoryUsage();
  const mbNow = mu['heapUsed'] / 1024 / 1024;
  //console.log(`Total allocated       ${Math.round(mbNow * 100) / 100} MB`);
  //console.log(`Total allocated       ${Math.round(mbNow * 100) / 100} GB`);
  //console.log(`Allocated since start ${Math.round((mbNow - gbStart) * 100) / 100} GB`);
  const currentmemory = Math.round(mbNow * 100) / 100;
  var htmlvar = {
    memoryUsage: currentmemory
  };
  //console.log("Process Memory Usage: " + mbNow);
  res.send(htmlvar);
  res.end();
});

router.get('/getmemoryexhaustion', function(req, res, next) {
  const mu = process.memoryUsage();
  const mbNow = mu['heapUsed'] / 1024 / 1024;
  const currentmemory = Math.round(mbNow * 100) / 100;
  var htmlvar = {
    memoryUsage: currentmemory
  };
  res.send(htmlvar);
  res.end();
});

module.exports = router;