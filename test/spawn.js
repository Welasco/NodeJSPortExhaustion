var spawn = require('child_process').spawn;
function getcpuload(callback) {
    var cpustatus = spawn('/bin/bash', ['./../tools/cpu.sh'], {detached: true});
    var cpuload = 0;
    // cpustatus.stdout.on('data', (data) => {
    //   cpuutil = parseFloat(data.toString())
    //   console.log("CPU Utilization: "+cpuutil);
    //   cpuload = cpuutil
    // });

    cpustatus.stdout.on("data", function (data) {
      console.log('stdout raw: '+data);
      cpuload = parseFloat(data.toString());
    });

    cpustatus.on('close', function(data){
      console.log('close: '+data);
      callback(cpuload);
    });   
    cpustatus.on("error", function (data) {
      console.log('error: '+data);
    });
}

// getcpuload(function(data){
//   console.log('{\'CPU\': '+data+'}'); 
// });

function test(callback) {
  // getcpuload(function(data){
  //   console.log('{\'CPU\': '+data+'}'); 
  //   callback(data);
  // });
  let re = 1+8;
  let write = function (msg) {
    console.log(msg);
  }
  callback(re,write);
}

test(function (datareturn,write) {
  console.log('callback return data: '+datareturn);
  getcpuload(function(data){
    console.log('{\'CPU\': '+data+'}'); 
    console.log(datareturn);
    write('inside getcpuload: '+data);
  });  
});
