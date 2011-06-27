/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ViewController",["dojo/_base/kernel","dojo/_base/declare","dojo/on","dojo/_base/array","dojo/DeferredList","./TransitionEvent","./ProgressIndicator"],function(_1,_2,on,_3,_4,_5,_6){
var _7=_1.declare(null,{constructor:function(){
this.viewMap={};
this.currentView=null;
this.defaultView=null;
_1.ready(_1.hitch(this,function(){
on(_1.body(),"startTransition",_1.hitch(this,"onStartTransition"));
}));
},findCurrentView:function(_8,_9){
if(_8){
var w=dijit.byId(_8);
if(w&&w.getShowingView){
return w.getShowingView();
}
}
if(dojox.mobile.currentView){
return dojox.mobile.currentView;
}
w=_9;
while(true){
w=w.getParent();
if(!w){
return null;
}
if(w instanceof dojox.mobile.View){
break;
}
}
return w;
},onStartTransition:function(_a){
_a.preventDefault();
if(!_a.detail||(_a.detail&&!_a.detail.moveTo&&!_a.detail.href&&!_a.detail.url&&!_a.detail.scene)){
return;
}
var w=this.findCurrentView(_a.detail.moveTo,(_a.target&&_a.target.id)?dijit.byId(_a.target.id):dijit.byId(_a.target));
if(!w||(_a.detail&&_a.detail.moveTo&&w===dijit.byId(_a.detail.moveTo))){
return;
}
if(_a.detail.href){
var t=dijit.byId(_a.target.id).hrefTarget;
if(t){
dojox.mobile.openWindow(_a.detail.href,t);
}else{
w.performTransition(null,_a.detail.transitionDir,_a.detail.transition,_a.target,function(){
location.href=_a.detail.href;
});
}
return;
}else{
if(_a.detail.scene){
_1.publish("/dojox/mobile/app/pushScene",[_a.detail.scene]);
return;
}
}
var _b=_a.detail.moveTo;
if(_a.detail.url){
var id;
if(dojox.mobile._viewMap&&dojox.mobile._viewMap[_a.detail.url]){
id=dojox.mobile._viewMap[_a.detail.url];
}else{
var _c=this._text;
if(!_c){
if(dijit.byId(_a.target.id).sync){
_c=_1.trim(_1._getText(_a.detail.url));
}else{
require(["dojo/_base/xhr"],_1.hitch(this,function(_d){
var _e=_6.getInstance();
_1.body().appendChild(_e.domNode);
_e.start();
var _d=_1.xhrGet({url:_a.detail.url,handleAs:"text"});
_d.addCallback(_1.hitch(this,function(_f,_10){
_e.stop();
if(_f){
this._text=_f;
new _5(_a.target,{transition:_a.detail.transition,transitionDir:_a.detail.transitionDir,moveTo:_b,href:_a.detail.href,url:_a.detail.url,scene:_a.detail.scene},_a.detail).dispatch();
}
}));
_d.addErrback(function(_11){
_e.stop();
});
}));
return;
}
}
this._text=null;
id=this._parse(_c);
if(!dojox.mobile._viewMap){
dojox.mobile._viewMap=[];
}
dojox.mobile._viewMap[_a.detail.url]=id;
}
_b=id;
w=this.findCurrentView(_b,dijit.byId(_a.target.id))||w;
}
w.performTransition(_b,_a.detail.transitionDir,_a.detail.transition,null,null);
},_parse:function(_12,id){
var _13=_1.create("DIV");
var _14;
var _15=this.findCurrentView();
var _16=dijit.byId(id)&&dijit.byId(id).containerNode||_1.byId(id)||_15&&_15.domNode.parentNode||_1.body();
if(_12.charAt(0)=="<"){
var _13=_1.create("DIV",{innerHTML:_12});
_14=_13.firstChild;
if(!_14&&_14.nodeType!=1){
return;
}
_14.style.visibility="hidden";
_16.appendChild(_13);
var ws=_1.parser.parse(_13);
_1.forEach(ws,function(w){
if(w&&!w._started&&w.startup){
w.startup();
}
});
_16.appendChild(_16.removeChild(_13).firstChild);
dijit.byNode(_14)._visible=true;
}else{
if(_12.charAt(0)=="{"){
_16.appendChild(_13);
this._ws=[];
_14=this._instantiate(eval("("+_12+")"),_13);
for(var i=0;i<this._ws.length;i++){
var w=this._ws[i];
w.startup&&!w._started&&(!w.getParent||!w.getParent())&&w.startup();
}
this._ws=null;
}
}
_14.style.display="none";
_14.style.visibility="visible";
var id=_14.id;
return _1.hash?"#"+id:id;
},_instantiate:function(obj,_17,_18){
var _19;
for(var key in obj){
if(key.charAt(0)=="@"){
continue;
}
var cls=_1.getObject(key);
if(!cls){
continue;
}
var _1a={};
var _1b=cls.prototype;
var _1c=_1.isArray(obj[key])?obj[key]:[obj[key]];
for(var i=0;i<_1c.length;i++){
for(var _1d in _1c[i]){
if(_1d.charAt(0)=="@"){
var val=_1c[i][_1d];
_1d=_1d.substring(1);
if(typeof _1b[_1d]=="string"){
_1a[_1d]=val;
}else{
if(typeof _1b[_1d]=="number"){
_1a[_1d]=val-0;
}else{
if(typeof _1b[_1d]=="boolean"){
_1a[_1d]=(val!="false");
}else{
if(typeof _1b[_1d]=="object"){
_1a[_1d]=eval("("+val+")");
}
}
}
}
}
}
_19=new cls(_1a,_17);
if(_17){
_19._visible=true;
this._ws.push(_19);
}
if(_18&&_18.addChild){
_18.addChild(_19);
}
this._instantiate(_1c[i],null,_19);
}
}
return _19&&_19.domNode;
}});
new _7();
return _7;
});
