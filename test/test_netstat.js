var netstat = require('node-netstat');
var connections = 0;
function getNetstat(pid) {
    var result = netstat({
        filter: {
            pid: pid,
            protocol: 'tcp'
        },
        sync: true
    }, function (data) {
        connections += 1;
    });
    return connections;
}

function checkNetPid(pid) {
    var running = false;
    var result = netstat({
        filter: {
            pid: pid
        },
        sync: true
    }, function (data) {
        running = true;
    });
    return running;
}


var test = getNetstat(18520);
var test2 = checkNetPid(18520);
console.log(test);
console.log(test2);