var http = require("http");


//////////////////////////////////////
/////    Calling API              ////
//////////////////////////////////////

function webapicall(method, backend, backendport, uripath, callbackapi) {
    //console.log("webapicall reached!");
    var resData = '';
    
    var opts = {
      method: method,
      host: backend,
      port: backendport,
      path: uripath,
      headers: {
      }
    };
  
    callback = function(res){
        try {
            res.on('data',function(d){
                resData += d;
                callbackapi(resData);
    
            });
        } catch (error) {
            callbackapi(JSON.stringify(res.message));
        }
    }

    var req = http.request(opts, callback);

    req.on('error', callback);
    req.end();
}

module.exports.webapicall = webapicall