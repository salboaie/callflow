var flow = require("../lib/flow.js");
var assert       = require('double-check').assert;


function asyncReturnsTrue(callback){
    setTimeout(function(){
        callback(null, true);
    }, 10);
}

assert.callback("Simple async status test", function(end){
    var logs = "";
    var expectedLogs = "begin" +
        "step1" +
        "step2" +
        "step3" +
        "end";

    var expectedStatuses = "created"+
            "running"+
            "running"+
            "running"+
            "running"+
            "running"+
            "done";

    var statuses = "";
    function testResults(){
        assert.equal(logs,expectedLogs,"Difference between expected logs and actual results");
        setTimeout(function(){
            statuses+=fl.getStatus();
            assert.equal(statuses,expectedStatuses,"Difference between expected statuses and actual statuses");
            end();
        },10)
    }

    var f = flow.create("Flow example", {
        begin:function(a1,a2){
            logs+="begin";
            statuses+=this.getStatus();
            this.step1("step1");
            this.step2();
        },
        step1:function(a){
            statuses+=this.getStatus();
            logs += "step1";
        },
        step2:function(a){
            statuses+=this.getStatus();
            logs += "step2";
            asyncReturnsTrue(this.continue("step3",'a'));
        },
        step3:function(a){
            statuses+=this.getStatus();
            logs+="step3";
        },
        end:{
            join:"step1,step3",
            code:function(a){
                statuses+=this.getStatus();
                logs += "end";
                testResults();
            }
        }
    });
    statuses+= "created";
    var fl = f();
})



