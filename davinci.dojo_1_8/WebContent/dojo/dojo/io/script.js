/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/io/script",["../_base/connect","../_base/kernel","../_base/lang","../sniff","../_base/window","../_base/xhr","../dom","../dom-construct","../request/script"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
dojo.deprecated("dojo/io/script","Use dojo/request/script.","2.0");
var _a=_4("ie")?"onreadystatechange":"load",_b=/complete|loaded/;
var _c={get:function(_d){
var _e;
var _f=this._makeScriptDeferred(_d,function(dfd){
_e&&_e.cancel();
});
var _10=_f.ioArgs;
_6._ioAddQueryToUrl(_10);
_6._ioNotifyStart(_f);
_e=_9.get(_10.url,{timeout:_d.timeout,jsonp:_10.jsonp,checkString:_d.checkString,ioArgs:_10,frameDoc:_d.frameDoc,canAttach:function(_11){
_10.requestId=_11.id;
_10.scriptId=_11.scriptId;
_10.canDelete=_11.canDelete;
return _c._canAttach(_10);
}},true);
_e.then(function(){
_f.resolve(_f);
}).otherwise(function(_12){
_f.ioArgs.error=_12;
_f.reject(_12);
});
return _f;
},attach:_9._attach,remove:_9._remove,_makeScriptDeferred:function(_13,_14){
var dfd=_6._ioSetArgs(_13,_14||this._deferredCancel,this._deferredOk,this._deferredError);
var _15=dfd.ioArgs;
_15.id=_2._scopeName+"IoScript"+(this._counter++);
_15.canDelete=false;
_15.jsonp=_13.callbackParamName||_13.jsonp;
if(_15.jsonp){
_15.query=_15.query||"";
if(_15.query.length>0){
_15.query+="&";
}
_15.query+=_15.jsonp+"="+(_13.frameDoc?"parent.":"")+_2._scopeName+".io.script.jsonp_"+_15.id+"._jsonpCallback";
_15.frameDoc=_13.frameDoc;
_15.canDelete=true;
dfd._jsonpCallback=this._jsonpCallback;
this["jsonp_"+_15.id]=dfd;
}
return dfd;
},_deferredCancel:function(dfd){
dfd.canceled=true;
},_deferredOk:function(dfd){
var _16=dfd.ioArgs;
return _16.json||_16.scriptLoaded||_16;
},_deferredError:function(_17,dfd){
return _17;
},_deadScripts:[],_counter:1,_addDeadScript:function(_18){
_c._deadScripts.push({id:_18.id,frameDoc:_18.frameDoc});
_18.frameDoc=null;
},_validCheck:function(dfd){
var _19=_c._deadScripts;
if(_19&&_19.length>0){
for(var i=0;i<_19.length;i++){
_c.remove(_19[i].id,_19[i].frameDoc);
_19[i].frameDoc=null;
}
_c._deadScripts=[];
}
return true;
},_ioCheck:function(dfd){
var _1a=dfd.ioArgs;
if(_1a.json||(_1a.scriptLoaded&&!_1a.args.checkString)){
return true;
}
var _1b=_1a.args.checkString;
return _1b&&eval("typeof("+_1b+") != 'undefined'");
},_resHandle:function(dfd){
if(_c._ioCheck(dfd)){
dfd.callback(dfd);
}else{
dfd.errback(new Error("inconceivable dojo.io.script._resHandle error"));
}
},_canAttach:function(){
return true;
},_jsonpCallback:function(_1c){
this.ioArgs.json=_1c;
_2.global[_9._callbacksProperty][this.ioArgs.requestId](_1c);
}};
_3.setObject("dojo.io.script",_c);
return _c;
});
