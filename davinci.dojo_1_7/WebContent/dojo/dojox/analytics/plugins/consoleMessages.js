/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/plugins/consoleMessages",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,da){
this.addData=_1.hitch(da,"addData","consoleMessages");
var _3=_1.config["consoleLogFuncs"]||["error","warn","info","rlog"];
if(!console){
console={};
}
for(var i=0;i<_3.length;i++){
if(console[_3[i]]){
_1.connect(console,_3[i],_1.hitch(this,"addData",_3[i]));
}else{
console[_3[i]]=_1.hitch(this,"addData",_3[i]);
}
}
return dojox.analytics.plugins.consoleMessages;
});
