var express = require('express');
var router = express.Router();
const Ajv = require('ajv');
const ajv = Ajv({ allErrors:true, removeAdditional:'all' });
var nconf = require('nconf');
var spawn = require('child_process').spawn;
var os = require('os')
var fs = require('fs');
var netstat = require('./../tools/netstat');
var webpaicall = require('./../tools/webapicall');
var socketcmd = require('./../models/socketcmd');
var socketstatus = require('./../models/socketstatus');

nconf.file({ file: '././tools/childstatus.json' });
nconf.set('pid', null);
nconf.set('pidhighcpu', []);
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


var allocations = []; 

router.get('/memoryexhaustion/blow', function(req, res, next) {
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

router.get('/memoryexhaustion/get', function(req, res, next) {
  const mu = process.memoryUsage();
  const mbNow = mu['heapUsed'] / 1024 / 1024;
  const currentmemory = Math.round(mbNow * 100) / 100;
  var htmlvar = {
    memoryUsage: currentmemory
  };
  res.send(htmlvar);
  res.end();
});

router.get('/memoryexhaustion/release', function(req, res, next) {
  allocations = [];
  allocations.length = 0;
  global.gc();
  const mu = process.memoryUsage();
  const mbNow = mu['heapUsed'] / 1024 / 1024;
  const currentmemory = Math.round(mbNow * 100) / 100;
  var htmlvar = {
    memoryUsage: currentmemory
  };
  res.send(htmlvar);
  res.end();
});

function buildFilePath(dirname,filename) {
  let dir = '';
  let dirpath = process.env.TMP;
  if(dirpath.indexOf('/') > -1) {
    dir = dirpath + '/' + dirname;
  }
  else{
    dir = dirpath + '\\' + dirname;
  }
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  let filedate = new Date();
  let fdate = filedate.getFullYear().toString()+ (filedate.getMonth()+1).toString() + filedate.getDate().toString() + filedate.getHours().toString() + filedate.getMinutes().toString() + filedate.getSeconds().toString() + filedate.getMilliseconds().toString();  
  
  let filepath = ''
  if(dirpath.indexOf('/') > -1) {
    filepath = dir + '/' + fdate + '-' + filename;
  }
  else{
    filepath = dir + '\\' + fdate + '-' + filename;
  }
  return filepath;
}

function buildFolderPath(dirname) {
  let dir = '';
  let dirpath = process.env.TMP;
  if(dirpath.indexOf('/') > -1) {
    dir = dirpath + '/' + dirname;
  }
  else{
    dir = dirpath + '\\' + dirname;
  }
  return dir;
}

function buildFileFolderPath(dirname,filename) {
  let dir = '';
  let dirpath = process.env.TMP;
  if(dirpath.indexOf('/') > -1) {
    dir = dirpath + '/' + dirname + '/' + filename;
  }
  else{
    dir = dirpath + '\\' + dirname + '\\' + filename;
  }
  return dir;
}

router.get('/filesystem/createfile', function(req, res, next) {
  let dirname = 'nodedir';
  let filename = 'nodejstempfile';
  let bfilepath = '';
  let filepath = '';
  let filesamount = 5;
  let bufferalloc = 1024*1024*100;
  for (let index = 0; index < filesamount; index++) {
    // const element = array[index];
    bfilepath = buildFilePath(dirname,filename);
    filepath = bfilepath + '-' + index.toString() + '.txt';
    fs.writeFile(filepath, new Buffer.alloc(bufferalloc), { flag: 'w' },function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved: " + filepath);
    });
  }
  // fs.stat(process.env.TMP+'\\'+dirname,function(err,stats){
  //   console.log("size: " + stats["size"]);
  // });
  
  var htmlvar = {
    Date: new Date().toISOString(),
    Call: 'createfile',
    SizeAddedtoFolder: filesamount*bufferalloc,
    FilesPath: buildFolderPath(dirname)
  };
  res.send(htmlvar);
  res.end();
});

router.get('/filesystem/getfiles', function(req, res, next) {
  let dirname = 'nodedir';
  let folderpath = buildFolderPath(dirname);
  console.log(folderpath);
  if (fs.existsSync(folderpath)){
    fs.readdir(folderpath, (err, files) => {
      console.log("Files: "+files.length);
      
      var htmlvar = {
        Date: new Date().toISOString(),
        Call: 'getfiles',
        FilesPath: buildFolderPath(dirname),
        FilesLength: files.length,
        FolderSizeBytes: files.length*1024*1024*100,
        FolderSizeKBs: (files.length*1024*100),
        FolderSizeMBs: (files.length*100),
      };
      res.send(htmlvar);
      res.end();    
    });  
  }
  else{
    var htmlvar = {
      Date: new Date().toISOString(),
      Call: 'getfiles',
      FilesPath: buildFolderPath(dirname),
      FilesLength: 0,
      FolderSizeBytes: 0,
      FolderSizeKBs: 0,
      FolderSizeMBs: 0,
    };
    res.send(htmlvar);
    res.end();    
  }
  //fs.stat(process.env.TMP+'\\'+dirname+'\\20196151434421-nodejstempfile-1.txt',function(err,stats){
  //  console.log("file size: " + stats["size"]);
  //});
  /*
  var htmlvar = {
    Date: new Date().toISOString()
  };
  res.send(htmlvar);
  res.end();
  */
});

router.get('/filesystem/removefiles', function(req, res, next) {
  let dirname = 'nodedir';
  //let folderpath = buildFolderPath(dirname)+'\\20196151434421-nodejstempfile-1.txt';
  let folderpath = buildFolderPath(dirname);
  console.log(folderpath);
  if (fs.existsSync(folderpath)){
    // fs.rmdir(folderpath, (err) => {
    //   var htmlvar = {};
    //   if(err) {
    //     console.log(err);
    //     htmlvar = {
    //       FilesDeleted: false
    //     };        
    //   }
    //   else {
    //     htmlvar = {
    //       FilesDeleted: true
    //     };
    //   }
    //   res.send(htmlvar);
    //   res.end();
    // });  

    fs.readdir(folderpath, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlink(buildFileFolderPath(dirname,file), err => {
          if (err) throw err;
        });
      }
      var htmlvar = {
        Date: new Date().toISOString(),
        Call: 'removefiles',
        FilesPath: buildFolderPath(dirname),
        FilesLength: 0,
        FolderSize: 'empty'
      };
      res.send(htmlvar);
      res.end();       
    });

  }
  else{
    var htmlvar = {
      Date: new Date().toISOString(),
      Call: 'removefiles',
      FilesPath: buildFolderPath(dirname),
      FilesLength: 0,
      FolderSize: 'empty'
    };
    res.send(htmlvar);
    res.end();    
  }

});

//////////////////////////
// HighCPU
//////////////////////////
function getcpuload(callback) {
  var cpustatus = spawn('/bin/bash', ['././tools/cpu.sh'], {detached: true});
  let cpuload = 0;
  //console.log('cpustatus: '+JSON.stringify(cpustatus));
  cpustatus.stdout.on('data', function (data) {
    cpuload = parseFloat(data.toString());
    //console.log("CPU Utilization: "+cpuload);
  });
  cpustatus.on('close', function(code){
    callback(cpuload);
  });
  cpustatus.on("error", function (data) {
    console.log('error: '+data);
  });    
}

router.get('/highcpu/get', function(req, res, next) {
  getcpuload(function(data){
    res.end('{\'CPU\': '+data+', \'numOfCpus\': '+os.cpus().length+'}'); 
  });

  ////////////////////////////////////////
  // working
  ////////////////////////////////////////
  // var cpustatus = spawn('/bin/bash', ['././tools/cpu.sh'], {detached: true});
  // //var cpustatus = spawn('ls', ['-la'], {detached: true});
  // let cpuload = 0;
  // console.log('cpustatus: '+JSON.stringify(cpustatus));
  // cpustatus.stdout.on('data', function (data) {
  //   cpuload = parseFloat(data.toString());
  //   console.log("CPU Utilization: "+cpuload);
  // });
  // cpustatus.on('close', function(code){
  //   //res.end(cpuload);
  //   res.end('{\'CPU\': '+cpuload+'}'); 
  // });
  // cpustatus.on("error", function (data) {
  //   console.log('error: '+data);
  //   res.end('error: '+data); 
  // }); 
  ////////////////////////////////////////

  //res.end('{\'CPU\': 1234}'); 
  //res.send('{\'CPU\': '+cpuutil+'}'); 
  //res.end(); 
});

function startChildProcesshighcpu(cmd) {
  var childhighcpu = spawn('node', ['././tools/highcpuchild.js', cmd.looptimes], {detached: true});
  
  childhighcpu.stdout.on('data', (data) => {
    console.log(`highcpu child stdout:\n${data}`);
  });
  
  childhighcpu.stderr.on('data', (data) => {
    console.error(`highcpu child stderr:\n${data}`);
  });  

  // nconf.set('pidhighcpu', childhighcpu.pid);
  // nconf.save();
  return childhighcpu.pid;
}

function pidIsRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch(e) {
    return false;
  }
}

function killhighcpuprocess(processArr) {
  for (let processpid = 0; processpid < processArr.length; processpid++) {
    if (pidIsRunning(processArr[processpid])) {
      process.kill(processArr[processpid]);
    }
  }
}

function controlhighcpuprocess(cmd) {
  const numOfCpus = cmd.numOfCpus
  var processArr = [];
  processArr = nconf.get('pidhighcpu');
  if (processArr != null) {
    if (processArr.length > 0) {
      killhighcpuprocess(processArr);
    }
  }
  processArr = [];
  
  for (let cpucount = 0; cpucount < numOfCpus; cpucount++) {
    var processId = startChildProcesshighcpu(cmd);
    processArr.push(processId);
  }
  nconf.set('pidhighcpu', processArr);
  nconf.save();

}

router.post('/highcpu/start', function(req, res, next) {
  var cmd = req.body;
  console.log(cmd);
  controlhighcpuprocess(cmd);

  getcpuload(function(data){
    res.end('{\'CPU\': '+data+', \'numOfCpus\': '+os.cpus().length+'}'); 
  });

});

router.get('/highcpu/stop', function(req, res, next) {

  var processArr = [];
  processArr = nconf.get('pidhighcpu');

  //if (processArr != null || processArr.length > 0) {
  if (processArr != null) {
    if (processArr.length > 0) {
      killhighcpuprocess(processArr);
    }
  }
  processArr = [];
  nconf.set('pidhighcpu', processArr);
  nconf.save();

  getcpuload(function(data){
    res.end('{\'CPU\': '+data+', \'numOfCpus\': '+os.cpus().length+'}'); 
  });  
});


module.exports = router;