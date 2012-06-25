/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/script",["module","require","./watch","./util","../_base/array","../_base/lang","../on","../dom","../dom-construct","../has","../_base/window"],function(_1,_2,_3,_4,_5,_6,on,_7,_8,_9,_a){
_9.add("script-readystatechange",function(_b,_c){
var _d=_c.createElement("script");
return typeof _d["onreadystatechange"]!=="undefined"&&(typeof _b["opera"]==="undefined"||_b["opera"].toString()!=="[object Opera]");
});
var _e=_1.id.replace(/[\/\.\-]/g,"_"),_f=0,_10=_9("script-readystatechange")?"readystatechange":"load",_11=/complete|loaded/,_12=this[_e+"_callbacks"]={},_13=[];
function _14(id,url,_15){
var doc=(_15||_a.doc),_16=doc.createElement("script");
_16.type="text/javascript";
_16.src=url;
_16.id=id;
_16.async=true;
_16.charset="utf-8";
return doc.getElementsByTagName("head")[0].appendChild(_16);
};
function _17(id,_18,_19){
_8.destroy(_7.byId(id,_18));
if(_12[id]){
if(_19){
_12[id]=function(){
delete _12[id];
};
}else{
delete _12[id];
}
}
};
function _1a(dfd){
var _1b=dfd.response;
_13.push({id:dfd.id,frameDoc:_1b.options.frameDoc});
_1b.options.frameDoc=null;
};
function _1c(dfd,_1d){
if(dfd.canDelete){
_1e._remove(dfd.id,_1d.options.frameDoc,true);
}
};
function _1f(_20){
if(_13&&_13.length){
_5.forEach(_13,function(_21){
_1e._remove(_21.id,_21.frameDoc);
_21.frameDoc=null;
});
_13=[];
}
return _20.options.jsonp?!_20.data:true;
};
function _22(_23){
return !!this.scriptLoaded;
};
function _24(_25){
var _26=_25.options.checkString;
return _26&&eval("typeof("+_26+") !== \"undefined\"");
};
function _27(_28,_29){
if(this.canDelete){
_1a(this);
}
if(_29){
this.reject(_29);
}else{
this.resolve(_28);
}
};
function _1e(url,_2a,_2b){
var _2c=_4.parseArgs(url,_4.deepCopy({},_2a));
url=_2c.url;
_2a=_2c.options;
var dfd=_4.deferred(_2c,_1c,_1f,_2a.jsonp?null:(_2a.checkString?_24:_22),_27);
_6.mixin(dfd,{id:_e+(_f++),canDelete:false});
if(_2a.jsonp){
var _2d=(~url.indexOf("?")?"&":"?")+_2a.jsonp+"=";
if(url.indexOf(_2d)===-1){
url+=_2d+(_2a.frameDoc?"parent.":"")+_e+"_callbacks."+dfd.id;
}
dfd.canDelete=true;
_12[dfd.id]=function(_2e){
_2c.data=_2e;
dfd.handleResponse(_2c);
};
}
try{
var _2f=_2("./notify");
_2f.send(_2c);
}
catch(e){
}
if(!_2a.canAttach||_2a.canAttach(dfd)){
var _30=_1e._attach(dfd.id,url,_2a.frameDoc);
if(!_2a.jsonp&&!_2a.checkString){
var _31=on(_30,_10,function(evt){
if(evt.type==="load"||_11.test(_30.readyState)){
_31.remove();
dfd.scriptLoaded=evt;
}
});
}
}
_3(dfd);
return _2b?dfd:dfd.promise;
};
_1e.get=_1e;
_1e._attach=_14;
_1e._remove=_17;
_1e._callbacksProperty=_e+"_callbacks";
return _1e;
});
