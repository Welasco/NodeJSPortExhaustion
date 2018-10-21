var cmd = {
    "Host": "",
    "Port": 0,
    "Connections": 0
};

const jsonschema_cmd = {
    "type": "object",
    "properties": {
        "Host": { "type": "string"},
        "Port": { "type": "integer" },
        "Connections": { "type": "integer" }
    },
    "required": [ "Host", "Port", "Connections" ]
  };

module.exports.cmd = cmd;
module.exports.jsonschema_cmd = jsonschema_cmd;