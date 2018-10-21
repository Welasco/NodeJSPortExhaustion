var netstat = require('./../tools/netstat');
var Socketstatus = {
    "OpenSockets": 0,
    "ClosedSockets": 0,
    "ConnectionStatus": "Disconnected",
    "ServerDateTime": new Date()
};

function GetSocketstatus(pid) {
    Clean()
    Socketstatus.OpenSockets = netstat.getNetstatOpen(pid);
    Socketstatus.ClosedSockets = netstat.getNetstatClosed(pid);
    if (Socketstatus.OpenSockets > 0) {
        Socketstatus.ConnectionStatus = 'Connected';
    }
    else{
        Socketstatus.ConnectionStatus = 'Disconnected';
    }
    return Socketstatus;
}

function Clean() {
    Socketstatus.OpenSockets = 0;
    Socketstatus.ClosedSockets = 0;
    Socketstatus.ConnectionStatus = "Disconnected";
    Socketstatus.ServerDateTime = new Date();
}

module.exports.Socketstatus = Socketstatus;
module.exports.GetSocketstatus = GetSocketstatus;
module.exports.Clean = Clean;