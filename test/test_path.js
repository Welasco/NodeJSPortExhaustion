var spawn = require('child_process').spawn;

var path = require('path');
var appDir = path.dirname(require.main.filename);
console.log(appDir);
console.log(process.cwd());

console.log(process.mainModule.paths[0].split('node_modules')[0].slice(0, -1));

//var child = spawn('node', ['./../tools/tcpportexhaustion.js', "www.google.com", 80, 10], {detached: true});

function test() {
    let child = spawn('node', ['./../tools/tcpportexhaustion.js', "www.google.com", 80, 10], {detached: true});    
    return child;
}
let child = test();
console.log(child.pid);

var fs = require('fs');
fs.writeFile("test.txt", "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 
