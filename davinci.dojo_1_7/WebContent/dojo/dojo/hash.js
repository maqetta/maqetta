/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/hash",["./_base/kernel","require","./_base/connect","./_base/lang","./ready","./_base/sniff","./_base/window"],function(_1,_2){
_1.hash=function(_3,_4){
if(!arguments.length){
return _5();
}
if(_3.charAt(0)=="#"){
_3=_3.substring(1);
}
if(_4){
_6(_3);
}else{
location.href="#"+_3;
}
return _3;
};
var _7,_8,_9,_a=_1.config.hashPollFrequency||100;
function _b(_c,_d){
var i=_c.indexOf(_d);
return (i>=0)?_c.substring(i+1):"";
};
function _5(){
return _b(location.href,"#");
};
function _e(){
_1.publish("/dojo/hashchange",[_5()]);
};
function _f(){
if(_5()===_7){
return;
}
_7=_5();
_e();
};
function _6(_10){
if(_8){
if(_8.isTransitioning()){
setTimeout(_1.hitch(null,_6,_10),_a);
return;
}
var _11=_8.iframe.location.href;
var _12=_11.indexOf("?");
_8.iframe.location.replace(_11.substring(0,_12)+"?"+_10);
return;
}
location.replace("#"+_10);
!_9&&_f();
};
function _13(){
var ifr=document.createElement("iframe"),_14="dojo-hash-iframe",_15=_1.config.dojoBlankHtmlUrl||_2.toUrl("./resources/blank.html");
if(_1.config.useXDomain&&!_1.config.dojoBlankHtmlUrl){
console.warn("dojo.hash: When using cross-domain Dojo builds,"+" please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl"+" to the path on your domain to blank.html");
}
ifr.id=_14;
ifr.src=_15+"?"+_5();
ifr.style.display="none";
document.body.appendChild(ifr);
this.iframe=_1.global[_14];
var _16,_17,_18,_19,_1a,_1b=this.iframe.location;
function _1c(){
_7=_5();
_16=_1a?_7:_b(_1b.href,"?");
_17=false;
_18=null;
};
this.isTransitioning=function(){
return _17;
};
this.pollLocation=function(){
if(!_1a){
try{
var _1d=_b(_1b.href,"?");
if(document.title!=_19){
_19=this.iframe.document.title=document.title;
}
}
catch(e){
_1a=true;
console.error("dojo.hash: Error adding history entry. Server unreachable.");
}
}
var _1e=_5();
if(_17&&_7===_1e){
if(_1a||_1d===_18){
_1c();
_e();
}else{
setTimeout(_1.hitch(this,this.pollLocation),0);
return;
}
}else{
if(_7===_1e&&(_1a||_16===_1d)){
}else{
if(_7!==_1e){
_7=_1e;
_17=true;
_18=_1e;
ifr.src=_15+"?"+_18;
_1a=false;
setTimeout(_1.hitch(this,this.pollLocation),0);
return;
}else{
if(!_1a){
location.href="#"+_1b.search.substring(1);
_1c();
_e();
}
}
}
}
setTimeout(_1.hitch(this,this.pollLocation),_a);
};
_1c();
setTimeout(_1.hitch(this,this.pollLocation),_a);
};
_1.addOnLoad(function(){
if("onhashchange" in _1.global&&(!_1.isIE||(_1.isIE>=8&&document.compatMode!="BackCompat"))){
_9=_1.connect(_1.global,"onhashchange",_e);
}else{
if(document.addEventListener){
_7=_5();
setInterval(_f,_a);
}else{
if(document.attachEvent){
_8=new _13();
}
}
}
});
return _1.hash;
});
