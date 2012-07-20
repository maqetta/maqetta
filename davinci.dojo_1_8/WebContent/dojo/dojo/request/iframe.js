/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/request/iframe",["module","require","./watch","./util","./handlers","../_base/lang","../query","../has","../dom","../dom-construct","../_base/window"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b){
var _c=_1.id.replace(/[\/\.\-]/g,"_"),_d=_c+"_onload";
if(!_b.global[_d]){
_b.global[_d]=function(){
var _e=_f._currentDfd;
if(!_e){
_f._fireNextRequest();
return;
}
var _10=_e.response,_11=_10.options,_12=_9.byId(_11.form);
if(_12){
var _13=_e._contentToClean;
for(var i=0;i<_13.length;i++){
var key=_13[i];
for(var j=0;j<_12.childNodes.length;j++){
var _14=_12.childNodes[j];
if(_14.name===key){
_a.destroy(_14);
break;
}
}
}
_e._originalAction&&_12.setAttribute("action",_e._originalAction);
if(_e._originalTarget){
_12.setAttribute("target",_e._originalTarget);
_12.target=_e._originalTarget;
}
}
_e._finished=true;
};
}
function _15(_16,_17,uri){
if(_b.global[_16]){
return _b.global[_16];
}
if(_b.global.frames[_16]){
return _b.global.frames[_16];
}
if(!uri){
if(_8("config-useXDomain")&&!_8("config-dojoBlankHtmlUrl")){
console.warn("dojo/request/iframe: When using cross-domain Dojo builds,"+" please save dojo/resources/blank.html to your domain and set dojoConfig.dojoBlankHtmlUrl"+" to the path on your domain to blank.html");
}
uri=(_8("config-dojoBlankHtmlUrl")||_2.toUrl("dojo/resources/blank.html"));
}
var _18=_a.place("<iframe id=\""+_16+"\" name=\""+_16+"\" src=\""+uri+"\" onload=\""+_17+"\" style=\"position: absolute; left: 1px; top: 1px; height: 1px; width: 1px; visibility: hidden\">",_b.body());
_b.global[_16]=_18;
return _18;
};
function _19(_1a,src,_1b){
var _1c=_b.global.frames[_1a.name];
if(_1c.contentWindow){
_1c=_1c.contentWindow;
}
try{
if(!_1b){
_1c.location=src;
}else{
_1c.location.replace(src);
}
}
catch(e){
}
};
function doc(_1d){
if(_1d.contentDocument){
return _1d.contentDocument;
}
var _1e=_1d.name;
if(_1e){
var _1f=_b.doc.getElementsByTagName("iframe");
if(_1d.document&&_1f[_1e].contentWindow&&_1f[_1e].contentWindow.document){
return _1f[_1e].contentWindow.document;
}else{
if(_b.doc.frames[_1e]&&_b.doc.frames[_1e].document){
return _b.doc.frames[_1e].document;
}
}
}
return null;
};
function _20(){
var dfd;
try{
if(_f._currentDfd||!_f._dfdQueue.length){
return;
}
do{
dfd=_f._currentDfd=_f._dfdQueue.shift();
}while(dfd&&(dfd.canceled||(dfd.isCanceled&&dfd.isCanceled()))&&_f._dfdQueue.length);
if(!dfd||dfd.canceled||(dfd.isCanceled&&dfd.isCanceled())){
_f._currentDfd=null;
return;
}
var _21=dfd.response,_22=_21.options,c2c=dfd._contentToClean=[],_23=_9.byId(_22.form),_24=_4.notify;
var _25=_22.data||null;
if(_23){
if(_25){
var _26=function(_27,_28){
_a.create("input",{type:"hidden",name:_27,value:_28},_23);
c2c.push(_27);
};
for(var x in _25){
var val=_25[x];
if(_6.isArray(val)&&val.length>1){
for(var i=0;i<val.length;i++){
_26(x,val[i]);
}
}else{
if(!_23[x]){
_26(x,val);
}else{
_23[x].value=val;
}
}
}
}
var _29=_23.getAttributeNode("action"),_2a=_23.getAttributeNode("method"),_2b=_23.getAttributeNode("target");
if(_21.url){
dfd._originalAction=_29?_29.value:null;
if(_29){
_29.value=_21.url;
}else{
_23.setAttribute("action",_21.url);
}
}
if(_2a){
_2a.value=_22.method;
}else{
_23.setAttribute("method",_22.method);
}
dfd._originalTarget=_2b?_2b.value:null;
if(_2b){
_2b.value=_f._iframeName;
}else{
_23.setAttribute("target",_f._iframeName);
}
_23.target=_f._iframeName;
_24&&_24.emit("send",_21);
_f._notifyStart(_21);
_23.submit();
}else{
_24&&_24.emit("send",_21);
_f._notifyStart(_21);
_f.setSrc(_f._frame,_21.url,true);
}
}
catch(e){
dfd.reject(e);
}
};
function _2c(_2d){
return !this.isFulfilled();
};
function _2e(_2f){
return !!this._finished;
};
function _30(_31,_32){
if(!_32){
try{
var _33=_31.options,doc=_f.doc(_f._frame),_34=_33.handleAs;
if(_34!=="html"){
if(_34==="xml"){
if(doc.documentElement.tagName.toLowerCase()==="html"){
_7("a",doc.documentElement).orphan();
var _35=doc.documentElement.innerText;
_35=_35.replace(/>\s+</g,"><");
_31.text=_6.trim(_35);
}else{
_31.data=doc;
}
}else{
_31.text=doc.getElementsByTagName("textarea")[0].value;
}
_5(_31);
}else{
_31.data=doc;
}
}
catch(e){
_32=e;
}
}
if(_32){
this.reject(_32);
}else{
if(this._finished){
this.resolve(_31);
}else{
this.reject(new Error("Invalid dojo/request/iframe request state"));
}
}
};
function _36(_37){
this._callNext();
};
var _38={method:"POST"};
function _f(url,_39,_3a){
var _3b=_4.parseArgs(url,_4.deepCreate(_38,_39),true);
url=_3b.url;
_39=_3b.options;
if(_39.method!=="GET"&&_39.method!=="POST"){
throw new Error(_39.method+" not supported by dojo/request/iframe");
}
if(!_f._frame){
_f._frame=_f.create(_f._iframeName,_d+"();");
}
var dfd=_4.deferred(_3b,null,_2c,_2e,_30,_36);
dfd._callNext=function(){
if(!this._calledNext){
this._calledNext=true;
_f._currentDfd=null;
_f._fireNextRequest();
}
};
_f._dfdQueue.push(dfd);
_f._fireNextRequest();
_3(dfd);
return _3a?dfd:dfd.promise;
};
_f.create=_15;
_f.doc=doc;
_f.setSrc=_19;
_f._iframeName=_c+"_IoIframe";
_f._notifyStart=function(){
};
_f._dfdQueue=[];
_f._currentDfd=null;
_f._fireNextRequest=_20;
_4.addCommonMethods(_f,["GET","POST"]);
return _f;
});
