/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/plugins/window",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,_3){
_3.plugins.window=new (function(){
this.addData=_1.hitch(_3,"addData","window");
this.windowConnects=_1.config["windowConnects"]||["open","onerror"];
for(var i=0;i<this.windowConnects.length;i++){
_1.connect(window,this.windowConnects[i],_1.hitch(this,"addData",this.windowConnects[i]));
}
_1.addOnLoad(_1.hitch(this,function(){
var _4={};
for(var i in window){
if(_1.isObject(window[i])){
switch(i){
case "location":
case "console":
_4[i]=window[i];
break;
default:
break;
}
}else{
_4[i]=window[i];
}
}
this.addData(_4);
}));
})();
return dojox.analytics.plugins.window;
});
