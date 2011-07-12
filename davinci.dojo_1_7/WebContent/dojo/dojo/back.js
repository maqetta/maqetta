/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/back",["./main","require"],function(_1,_2){
_1.getObject("back",true,_1);
var _3=_1.back,_4=_3.getHash=function(){
var h=window.location.hash;
if(h.charAt(0)=="#"){
h=h.substring(1);
}
return _1.isMozilla?h:decodeURIComponent(h);
},_5=_3.setHash=function(h){
if(!h){
h="";
}
window.location.hash=encodeURIComponent(h);
_6=history.length;
};
var _7=(typeof (window)!=="undefined")?window.location.href:"";
var _8=(typeof (window)!=="undefined")?_4():"";
var _9=null;
var _a=null;
var _b=null;
var _c=null;
var _d=[];
var _e=[];
var _f=false;
var _10=false;
var _6;
function _11(){
var _12=_e.pop();
if(!_12){
return;
}
var _13=_e[_e.length-1];
if(!_13&&_e.length==0){
_13=_9;
}
if(_13){
if(_13.kwArgs["back"]){
_13.kwArgs["back"]();
}else{
if(_13.kwArgs["backButton"]){
_13.kwArgs["backButton"]();
}else{
if(_13.kwArgs["handle"]){
_13.kwArgs.handle("back");
}
}
}
}
_d.push(_12);
};
_3.goBack=_11;
function _14(){
var _15=_d.pop();
if(!_15){
return;
}
if(_15.kwArgs["forward"]){
_15.kwArgs.forward();
}else{
if(_15.kwArgs["forwardButton"]){
_15.kwArgs.forwardButton();
}else{
if(_15.kwArgs["handle"]){
_15.kwArgs.handle("forward");
}
}
}
_e.push(_15);
};
_3.goForward=_14;
function _16(url,_17,_18){
return {"url":url,"kwArgs":_17,"urlHash":_18};
};
function _19(url){
var _1a=url.split("?");
if(_1a.length<2){
return null;
}else{
return _1a[1];
}
};
function _1b(){
var url=(_1.config["dojoIframeHistoryUrl"]||_2.toUrl("./resources/iframe_history.html"))+"?"+(new Date()).getTime();
_f=true;
if(_c){
_1.isWebKit?_c.location=url:window.frames[_c.name].location=url;
}else{
}
return url;
};
function _1c(){
if(!_10){
var hsl=_e.length;
var _1d=_4();
if((_1d===_8||window.location.href==_7)&&(hsl==1)){
_11();
return;
}
if(_d.length>0){
if(_d[_d.length-1].urlHash===_1d){
_14();
return;
}
}
if((hsl>=2)&&(_e[hsl-2])){
if(_e[hsl-2].urlHash===_1d){
_11();
}
}
}
};
_3.init=function(){
if(_1.byId("dj_history")){
return;
}
var src=_1.config["dojoIframeHistoryUrl"]||_2.toUrl("./resources/iframe_history.html");
if(_1._postLoad){
console.error("dojo.back.init() must be called before the DOM has loaded. "+"If using xdomain loading or djConfig.debugAtAllCosts, include dojo.back "+"in a build layer.");
}else{
document.write("<iframe style=\"border:0;width:1px;height:1px;position:absolute;visibility:hidden;bottom:0;right:0;\" name=\"dj_history\" id=\"dj_history\" src=\""+src+"\"></iframe>");
}
};
_3.setInitialState=function(_1e){
_9=_16(_7,_1e,_8);
};
_3.addToHistory=function(_1f){
_d=[];
var _20=null;
var url=null;
if(!_c){
if(_1.config["useXDomain"]&&!_1.config["dojoIframeHistoryUrl"]){
console.warn("dojo.back: When using cross-domain Dojo builds,"+" please save iframe_history.html to your domain and set djConfig.dojoIframeHistoryUrl"+" to the path on your domain to iframe_history.html");
}
_c=window.frames["dj_history"];
}
if(!_b){
_b=_1.create("a",{style:{display:"none"}},_1.body());
}
if(_1f["changeUrl"]){
_20=""+((_1f["changeUrl"]!==true)?_1f["changeUrl"]:(new Date()).getTime());
if(_e.length==0&&_9.urlHash==_20){
_9=_16(url,_1f,_20);
return;
}else{
if(_e.length>0&&_e[_e.length-1].urlHash==_20){
_e[_e.length-1]=_16(url,_1f,_20);
return;
}
}
_10=true;
setTimeout(function(){
_5(_20);
_10=false;
},1);
_b.href=_20;
if(_1.isIE){
url=_1b();
var _21=_1f["back"]||_1f["backButton"]||_1f["handle"];
var tcb=function(_22){
if(_4()!=""){
setTimeout(function(){
_5(_20);
},1);
}
_21.apply(this,[_22]);
};
if(_1f["back"]){
_1f.back=tcb;
}else{
if(_1f["backButton"]){
_1f.backButton=tcb;
}else{
if(_1f["handle"]){
_1f.handle=tcb;
}
}
}
var _23=_1f["forward"]||_1f["forwardButton"]||_1f["handle"];
var tfw=function(_24){
if(_4()!=""){
_5(_20);
}
if(_23){
_23.apply(this,[_24]);
}
};
if(_1f["forward"]){
_1f.forward=tfw;
}else{
if(_1f["forwardButton"]){
_1f.forwardButton=tfw;
}else{
if(_1f["handle"]){
_1f.handle=tfw;
}
}
}
}else{
if(!_1.isIE){
if(!_a){
_a=setInterval(_1c,200);
}
}
}
}else{
url=_1b();
}
_e.push(_16(url,_1f,_20));
};
_3._iframeLoaded=function(evt,_25){
var _26=_19(_25.href);
if(_26==null){
if(_e.length==1){
_11();
}
return;
}
if(_f){
_f=false;
return;
}
if(_e.length>=2&&_26==_19(_e[_e.length-2].url)){
_11();
}else{
if(_d.length>0&&_26==_19(_d[_d.length-1].url)){
_14();
}
}
};
return _1.back;
});
