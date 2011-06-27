/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/plugins/mouseOver",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,_3){
_3.plugins.mouseOver=new (function(){
this.watchMouse=_1.config["watchMouseOver"]||true;
this.mouseSampleDelay=_1.config["sampleDelay"]||2500;
this.addData=_1.hitch(_3,"addData","mouseOver");
this.targetProps=_1.config["targetProps"]||["id","className","localName","href","spellcheck","lang","textContent","value"];
this.toggleWatchMouse=function(){
if(this._watchingMouse){
_1.disconnect(this._watchingMouse);
delete this._watchingMouse;
return;
}
_1.connect(_1.doc,"onmousemove",this,"sampleMouse");
};
if(this.watchMouse){
_1.connect(_1.doc,"onmouseover",this,"toggleWatchMouse");
_1.connect(_1.doc,"onmouseout",this,"toggleWatchMouse");
}
this.sampleMouse=function(e){
if(!this._rateLimited){
this.addData("sample",this.trimMouseEvent(e));
this._rateLimited=true;
setTimeout(_1.hitch(this,function(){
if(this._rateLimited){
this.trimMouseEvent(this._lastMouseEvent);
delete this._lastMouseEvent;
delete this._rateLimited;
}
}),this.mouseSampleDelay);
}
this._lastMouseEvent=e;
return e;
};
this.trimMouseEvent=function(e){
var t={};
for(var i in e){
switch(i){
case "target":
var _4=this.targetProps;
t[i]={};
for(var j=0;j<_4.length;j++){
if(_1.isObject(e[i])&&_4[j] in e[i]){
if(_4[j]=="text"||_4[j]=="textContent"){
if(e[i]["localName"]&&(e[i]["localName"]!="HTML")&&(e[i]["localName"]!="BODY")){
t[i][_4[j]]=e[i][_4[j]].substr(0,50);
}
}else{
t[i][_4[j]]=e[i][_4[j]];
}
}
}
break;
case "x":
case "y":
if(e[i]){
var _5=e[i];
t[i]=_5+"";
}
break;
default:
break;
}
}
return t;
};
})();
return dojox.analytics.plugins.mouseOver;
});
