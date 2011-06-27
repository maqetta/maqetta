/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/io/xhrMultiPart",["dojo/_base/array","dojo/query","dojox/uuid/generateRandomUuid","dojo/_base/xhr"],function(_1,_2,_3){
_1.getObject("io.xhrMultiPart",true,dojox);
function _4(_5,_6){
if(!_5["name"]&&!_5["content"]){
throw new Error("Each part of a multi-part request requires 'name' and 'content'.");
}
var _7=[];
_7.push("--"+_6,"Content-Disposition: form-data; name=\""+_5.name+"\""+(_5["filename"]?"; filename=\""+_5.filename+"\"":""));
if(_5["contentType"]){
var ct="Content-Type: "+_5.contentType;
if(_5["charset"]){
ct+="; Charset="+_5.charset;
}
_7.push(ct);
}
if(_5["contentTransferEncoding"]){
_7.push("Content-Transfer-Encoding: "+_5.contentTransferEncoding);
}
_7.push("",_5.content);
return _7;
};
function _8(_9,_a){
var o=_1.formToObject(_9),_b=[];
for(var p in o){
if(_1.isArray(o[p])){
_1.forEach(o[p],function(_c){
_b=_b.concat(_4({name:p,content:_c},_a));
});
}else{
_b=_b.concat(_4({name:p,content:o[p]},_a));
}
}
return _b;
};
dojox.io.xhrMultiPart=function(_d){
if(!_d["file"]&&!_d["content"]&&!_d["form"]){
throw new Error("content, file or form must be provided to dojox.io.xhrMultiPart's arguments");
}
var _e=_3(),_f=[],out="";
if(_d["file"]||_d["content"]){
var v=_d["file"]||_d["content"];
_1.forEach((_1.isArray(v)?v:[v]),function(_10){
_f=_f.concat(_4(_10,_e));
});
}else{
if(_d["form"]){
if(_2("input[type=file]",_d["form"]).length){
throw new Error("dojox.io.xhrMultiPart cannot post files that are values of an INPUT TYPE=FILE.  Use dojo.io.iframe.send() instead.");
}
_f=_8(_d["form"],_e);
}
}
if(_f.length){
_f.push("--"+_e+"--","");
out=_f.join("\r\n");
}
return _1.rawXhrPost(_1.mixin(_d,{contentType:"multipart/form-data; boundary="+_e,postData:out}));
};
return dojox.io.xhrMultiPart;
});
