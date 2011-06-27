/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/_base",["dojo/_base/kernel","dojo/_base/lang"],function(_1){
dojox.analytics=function(){
this._data=[];
this._id=1;
this.sendInterval=_1.config["sendInterval"]||5000;
this.inTransitRetry=_1.config["inTransitRetry"]||200;
this.dataUrl=_1.config["analyticsUrl"]||_1.moduleUrl("dojox.analytics.logger","dojoxAnalytics.php");
this.sendMethod=_1.config["sendMethod"]||"xhrPost";
this.maxRequestSize=_1.isIE?2000:_1.config["maxRequestSize"]||4000;
_1.addOnLoad(this,"schedulePusher");
_1.addOnUnload(this,"pushData",true);
};
_1.extend(dojox.analytics,{schedulePusher:function(_2){
setTimeout(_1.hitch(this,"checkData"),_2||this.sendInterval);
},addData:function(_3,_4){
if(arguments.length>2){
var c=[];
for(var i=1;i<arguments.length;i++){
c.push(arguments[i]);
}
_4=c;
}
this._data.push({plugin:_3,data:_4});
},checkData:function(){
if(this._inTransit){
this.schedulePusher(this.inTransitRetry);
return;
}
if(this.pushData()){
return;
}
this.schedulePusher();
},pushData:function(){
if(this._data.length){
this._inTransit=this._data;
this._data=[];
var _5;
switch(this.sendMethod){
case "script":
_5=_1.io.script.get({url:this.getQueryPacket(),preventCache:1,callbackParamName:"callback"});
break;
case "xhrPost":
default:
_5=_1.xhrPost({url:this.dataUrl,content:{id:this._id++,data:_1.toJson(this._inTransit)}});
break;
}
_5.addCallback(this,"onPushComplete");
return _5;
}
return false;
},getQueryPacket:function(){
while(true){
var _6={id:this._id++,data:_1.toJson(this._inTransit)};
var _7=this.dataUrl+"?"+_1.objectToQuery(_6);
if(_7.length>this.maxRequestSize){
this._data.unshift(this._inTransit.pop());
this._split=1;
}else{
return _7;
}
}
},onPushComplete:function(_8){
if(this._inTransit){
delete this._inTransit;
}
if(this._data.length>0){
this.schedulePusher(this.inTransitRetry);
}else{
this.schedulePusher();
}
}});
dojox.analytics=new dojox.analytics();
return dojox.analytics;
});
