var spawn = require('child_process').spawn;
var childhighcpu = spawn('/bin/bash', ['cpu.sh'], {detached: true});

childhighcpu.stdout.on('data', (data) => {
    console.log(`${data}`);
});