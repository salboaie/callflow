require("../../../psknode/bundles/pskruntime"); 
var assert = require('double-check').assert;

var f = $$.callflow.describe("joinsExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.callback =callback;
        this.result = 0;
        var join = this.parallel(this.doJoin);
        join.doStep1(1);
        join.doStep2(2);
    },
    doStep1:function(value){
        this.result += value;

    },
    doStep2:function(value){
        this.result += value;
    },
    doJoin:function(err){
        assert.equal(err,null,"Error");
        assert.equal(this.result,3,"Results don't match");
        this.callback();
    }
})();
assert.callback("Parallel test",function(callback){
    f.start(callback);
})
