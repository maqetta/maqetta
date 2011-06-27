/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
exports.config=function(_1){
for(var _2=[],_3=[],i=0;i<process.argv.length;i++){
var _4=(process.argv[i]+"").split("=");
if(_4[0]=="load"){
_2.push(_4[1]);
}else{
_3.push(_4);
}
}
var fs=require("fs");
var _5={"host-node":1,"host-browser":0,"dom":0,"dojo-has-api":1,"dojo-xhr-factory":0,"dojo-inject-api":1,"dojo-timeout-api":0,"dojo-trace-api":1,"dojo-loader-catches":1,"dojo-dom-ready-api":0,"dojo-dom-ready-plugin":0,"dojo-ready-api":1,"dojo-error-api":1,"dojo-publish-privates":1,"dojo-gettext-api":1,"dojo-sniff":0,"dojo-loader":1,"dojo-test-xd":0,"dojo-test-sniff":0};
for(var p in _5){
_1.hasCache[p]=_5[p];
}
var vm=require("vm");
var _6={baseUrl:__dirname.match(/(.+)\/_base$/)[1],commandLineArgs:_3,deps:_2,timeout:0,locale:"us-en",debug:function(_7){
require("util").debug(_7);
},eval:function(_8,_9){
return vm.runInThisContext(_8,_9);
},injectUrl:function(_a,_b){
try{
vm.runInThisContext(fs.readFileSync(_a,"utf8"),_a);
_b();
}
catch(e){
}
},getText:function(_c,_d,_e){
_e(fs.readFileSync(_c,"utf8"));
}};
for(p in _6){
_1[p]=_6[p];
}
};
