var express = require('express');
var router = express.Router();
const Ajv = require('ajv');
const ajv = Ajv({ allErrors:true, removeAdditional:'all' });
var nconf = require('nconf');
var spawn = require('child_process').spawn;
var netstat = require('./../tools/netstat');
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

module.exports = router;