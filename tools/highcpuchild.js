#!/usr/bin/env nodejs

var args = process.argv.slice();
console.log(args);

var looptimes = args[2] || 1

for (let indexloop = 0; indexloop < looptimes; indexloop++) {
    reportnum = 1;
    for (let index = 1; index < 2147483647; index++) {
        reportnum = reportnum * index;
    }    
}
