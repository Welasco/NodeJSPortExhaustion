const Ajv = require('ajv');
//const ajv = Ajv({ allErrors:true, removeAdditional:'all' });
const ajv = Ajv({allErrors:true});

/*
const jsoncmd = {
    "cmd": {
        "type": "object",
        "properties": {
        "Host": {
            "type": [ "string", "null" ]
        },
        "Port": { "type": "integer" },
        "Connections": { "type": "integer" }
        },
        "required": [ "Host", "Port", "Connections" ]
    }
};
*/

const jsoncmd = {
    "type": "object",
    "properties": {
        "Host": { "type": "string"},
        "Port": { "type": "integer" },
        "Connections": { "type": "integer" }
    },
    "required": [ "Host", "Port", "Connections" ]
};

const testjson = {
    "Host": "www.google.com",
    "Port": 80,
    "Connections": 10
}

//ajv.addSchema('jsoncmd', jsoncmd);
ajv.addSchema(jsoncmd,'jsoncmd');

if (ajv.validate('jsoncmd', testjson)) {
    console.log("test");
}
//console.log(env.resolve(jsoncmd));

var t = ajv.validate('jsoncmd', testjson);
var tt = ajv.validate('jsoncmd', { type: 'custom' });

console.log(t);
console.log(tt);