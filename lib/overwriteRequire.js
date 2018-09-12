
/*
 require and requireLibrary are overwriting the node.js defaults in loading modules for increasing security and speed.
 We guarantee that each module or library is loaded only once and only from a single folder... Use the standard require if you need something else!

 */


if (typeof(window) !== "undefined") {
    global = window;
}


if(typeof(global.$$) == "undefined") {
    global.$$ = {};
    $$.__global = {

    };
}

if(typeof(global.functionUndefined) == "undefined"){
    global.functionUndefined = function(){
        console.log("Called of an undefined function!!!!");
        throw new Error("Called of an undefined function");
    }
    if(typeof(global.browserRequire) == "undefined"){
        global.browserRequire = global.functionUndefined;
    }

    if(typeof(global.domainRequire) == "undefined"){
        global.domainRequire = global.functionUndefined;
    }

    if(typeof(global.pskruntimeRequire) == "undefined"){
        global.pskruntimeRequire = global.functionUndefined;
    }
}

if(typeof($$.log) == "undefined") {
    $$.log = function(...args){
        console.log(args.join(" "));
    }
}


var weAreInbrowser = (typeof($$.browserRuntime) != "undefined");


var pastRequests = {};
function preventRecursiveRequire(request){
    if(pastRequests[request]){
        var err = new Error("Preventing recursive require for " + request);
        err.type = "PSKIgnorableError"
        throw err;
    }

}

function disableRequire(request){
    pastRequests[request] = true;
}

function enableRequire(request){
    pastRequests[request] = false;
}


function requireFromCache(request){
    var existingModule = $$.__runtimeModules[request];
    return  existingModule;
}

function tryRequireSequence(arr, request){
    preventRecursiveRequire(request);
    disableRequire(request);
    var result;
    for(var i = 0; i < arr.length; i++){
        var func = arr[i];
        try{

            if(func === global.functionUndefined) continue;
            result = func(request);
            if(result){
                //console.log("returning result for ", request, !!result);
                $$.__runtimeModules[request] = result;
                break;
            }
        } catch(err){
            if(err.type != "PSKIgnorableError"){
                $$.log("Require failed in ", func, request, err);
            }
        }
    }

    if(!result){
        $$.log("Failed to load module ", request, result);
    }

    enableRequire(request);
    return result;
}


if (typeof($$.require) == "undefined") {
    $$.__runtimeModules = {};

    if (!weAreInbrowser) {  //we are in node

        $$.__runtimeModules["crypto"] = require("crypto");
        $$.__runtimeModules["util"] = require("util");

        $$.log("Redefining require for node");
        var Module = require('module');
        $$.__originalRequire = Module._load;

        function newLoader(request) {
            //preventRecursiveRequire(request);

            var self = this;
            function originalRequire(...args){
                return $$.__originalRequire.apply(self,args);
            }

            return tryRequireSequence([requireFromCache, pskruntimeRequire, domainRequire, originalRequire], request);
        }

        Module._load = newLoader;

    } else {
        $$.log("Defining global require in browser");

        global.require = function(request){

            return tryRequireSequence([requireFromCache, browserRequire, domainRequire, pskruntimeRequire], request);
        }
    }

    $$.require = require;
}