var netstat = require('node-netstat');


function getNetstatOpen(pid) {
    var connections = 0;
    var result = netstat({
        filter: {
            pid: pid,
            protocol: 'tcp',
            state: 'ESTABLISHED'
        },
        sync: true
    }, function (data) {
        connections += 1;
    });
    return connections;
}

function getNetstatClosed(pid) {
    let allconnections = 0;
    var result = netstat({
        filter: {
            pid: pid,
            protocol: 'tcp'
        },
        sync: true
    }, function (data) {
        allconnections += 1;
    });

    var openconnections = getNetstatOpen(pid);
    var result = allconnections - openconnections;

    return result;
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

module.exports.getNetstatOpen = getNetstatOpen;
module.exports.getNetstatClosed = getNetstatClosed;
module.exports.checkNetPid = checkNetPid;