/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/common",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/array","dojo/_base/html","dojo/ready","dijit/_WidgetBase"],function(_1,_2,_3,_4,_5,_6){
_1.getObject("mobile",true,dojox);
var ua=navigator.userAgent;
_1.isBB=ua.indexOf("BlackBerry")>=0&&parseFloat(ua.split("Version/")[1])||undefined;
_1.isAndroid=parseFloat(ua.split("Android ")[1])||undefined;
if(ua.match(/(iPhone|iPod|iPad)/)){
var p="is"+RegExp.$1.replace(/i/,"I");
var v=ua.match(/OS ([\d_]+)/)?RegExp.$1:"1";
_1.isIPhone=_1[p]=parseFloat(v.replace(/_/,".").replace(/_/g,""));
}
var _7=_1.doc.documentElement;
_7.className+=_1.trim([_1.isBB?"dj_bb":"",_1.isAndroid?"dj_android":"",_1.isIPhone?"dj_iphone":"",_1.isIPod?"dj_ipod":"",_1.isIPad?"dj_ipad":""].join(" ").replace(/ +/g," "));
var dm=dojox.mobile;
dm.getScreenSize=function(){
return {h:_1.global.innerHeight||_1.doc.documentElement.clientHeight,w:_1.global.innerWidth||_1.doc.documentElement.clientWidth};
};
dm.updateOrient=function(){
var _8=dm.getScreenSize();
_1.replaceClass(_1.doc.documentElement,_8.h>_8.w?"dj_portrait":"dj_landscape",_8.h>_8.w?"dj_landscape":"dj_portrait");
};
dm.updateOrient();
dm.tabletSize=500;
dm.detectScreenSize=function(_9){
var _a=dm.getScreenSize();
var sz=Math.min(_a.w,_a.h);
var _b,to;
if(sz>=dm.tabletSize&&(_9||(!this._sz||this._sz<dm.tabletSize))){
_b="phone";
to="tablet";
}else{
if(sz<dm.tabletSize&&(_9||(!this._sz||this._sz>=dm.tabletSize))){
_b="tablet";
to="phone";
}
}
if(to){
_1.replaceClass(_1.doc.documentElement,"dj_"+to,"dj_"+_b);
_1.publish("/dojox/mobile/screenSize/"+to,[_a]);
}
this._sz=sz;
};
dm.detectScreenSize();
dm.setupIcon=function(_c,_d){
if(_c&&_d){
var _e=_1.map(_d.split(/[ ,]/),function(_f){
return _f-0;
});
var t=_e[0];
var r=_e[1]+_e[2];
var b=_e[0]+_e[3];
var l=_e[1];
var _10=_c.parentNode?_1.style(_c.parentNode,"paddingLeft"):8;
_1.style(_c,{clip:"rect("+t+"px "+r+"px "+b+"px "+l+"px)",top:(_c.parentNode?_1.style(_c,"top"):0)-t+"px",left:_10-l+"px"});
}
};
dm.hideAddressBarWait=typeof (_1.config["mblHideAddressBarWait"])==="number"?_1.config["mblHideAddressBarWait"]:1500;
dm.hide_1=function(_11){
scrollTo(0,1);
var h=dm.getScreenSize().h+"px";
if(_1.isAndroid){
if(_11){
_1.body().style.minHeight=h;
}
dm.resizeAll();
}else{
if(_11||dm._h===h&&h!==_1.body().style.minHeight){
_1.body().style.minHeight=h;
dm.resizeAll();
}
}
dm._h=h;
};
dm.hide_fs=function(){
var t=_1.body().style.minHeight;
_1.body().style.minHeight=(dm.getScreenSize().h*2)+"px";
scrollTo(0,1);
setTimeout(function(){
dm.hide_1(1);
dm._hiding=false;
},1000);
};
dm.hideAddressBar=function(evt){
if(dm.disableHideAddressBar||dm._hiding){
return;
}
dm._hiding=true;
dm._h=0;
_1.body().style.minHeight=(dm.getScreenSize().h*2)+"px";
setTimeout(dm.hide_1,0);
setTimeout(dm.hide_1,200);
setTimeout(dm.hide_1,800);
setTimeout(dm.hide_fs,dm.hideAddressBarWait);
};
dm.resizeAll=function(evt,_12){
if(dm.disableResizeAll){
return;
}
_1.publish("/dojox/mobile/resizeAll",[evt,_12]);
dm.updateOrient();
dm.detectScreenSize();
var _13=function(w){
var _14=w.getParent&&w.getParent();
return !!((!_14||!_14.resize)&&w.resize);
};
var _15=function(w){
_1.forEach(w.getChildren(),function(_16){
if(_13(_16)){
_16.resize();
}
_15(_16);
});
};
if(_12){
if(_12.resize){
_12.resize();
}
_15(_12);
}else{
dijit.registry.filter(_13).forEach(function(w){
w.resize();
});
}
};
dm.openWindow=function(url,_17){
_1.global.open(url,_17||"_blank");
};
dm.createDomButton=function(_18,_19,_1a){
var s=_18.className;
var _1b=_1a||_18;
if(s.match(/(mblDomButton\w+)/)&&s.indexOf("/")===-1){
var _1c=RegExp.$1;
var _1d=4;
if(s.match(/(mblDomButton\w+_(\d+))/)){
_1d=RegExp.$2-0;
}
for(var i=0,p=_1b;i<_1d;i++){
p=p.firstChild||_1.create("DIV",null,p);
}
if(_1a){
setTimeout(function(){
_1.removeClass(_18,_1c);
},0);
_1.addClass(_1a,_1c);
}
}else{
if(s.indexOf(".")!==-1){
_1.create("IMG",{src:s},_1b);
}else{
return null;
}
}
_1.addClass(_1b,"mblDomButton");
_1.style(_1b,_19);
return _1b;
};
dm.createIcon=function(_1e,_1f,_20,_21,_22){
if(_1e&&_1e.indexOf("mblDomButton")===0){
if(_20&&_20.className.match(/(mblDomButton\w+)/)){
_1.removeClass(_20,RegExp.$1);
}else{
_20=_1.create("DIV");
}
_20.title=_21;
_1.addClass(_20,_1e);
dm.createDomButton(_20);
}else{
if(_1e&&_1e!=="none"){
if(!_20||_20.nodeName!=="IMG"){
_20=_1.create("IMG",{alt:_21});
}
_20.src=_1e;
dm.setupIcon(_20,_1f);
if(_22&&_1f){
var arr=_1f.split(/[ ,]/);
_1.style(_22,{width:arr[2]+"px",height:arr[3]+"px"});
}
}
}
if(_22){
_22.appendChild(_20);
}
return _20;
};
if(_1.config.parseOnLoad){
_1.ready(90,function(){
var _23=_1.body().getElementsByTagName("*");
var i,len,s;
len=_23.length;
for(i=0;i<len;i++){
s=_23[i].getAttribute("dojoType");
if(s){
if(_23[i].parentNode.getAttribute("lazy")=="true"){
_23[i].setAttribute("__dojoType",s);
_23[i].removeAttribute("dojoType");
}
}
}
});
}
_1.addOnLoad(function(){
dm.detectScreenSize(true);
if(_1.config["mblApplyPageStyles"]!==false){
_1.addClass(_1.doc.documentElement,"mobile");
}
if(_1.config["mblAndroidWorkaround"]!==false&&_1.isAndroid>=2.2&&_1.isAndroid<3.1){
if(_1.config["mblAndroidWorkaroundButtonStyle"]!==false){
_1.create("style",{innerHTML:"BUTTON,INPUT[type='button'],INPUT[type='submit'],INPUT[type='reset'],INPUT[type='file']::-webkit-file-upload-button{-webkit-appearance:none;}"},_1.doc.head,"first");
}
if(_1.isAndroid<3){
_1.style(_1.doc.documentElement,"webkitTransform","translate3d(0,0,0)");
_1.connect(null,"onfocus",null,function(e){
_1.style(_1.doc.documentElement,"webkitTransform","");
});
_1.connect(null,"onblur",null,function(e){
_1.style(_1.doc.documentElement,"webkitTransform","translate3d(0,0,0)");
});
}else{
if(_1.config["mblAndroid3Workaround"]!==false){
_1.style(_1.doc.documentElement,{webkitBackfaceVisibility:"hidden",webkitPerspective:8000});
}
}
}
var f=dm.resizeAll;
if(_1.config["mblHideAddressBar"]!==false&&navigator.appVersion.indexOf("Mobile")!=-1||_1.config["mblForceHideAddressBar"]===true){
dm.hideAddressBar();
if(_1.config["mblAlwaysHideAddressBar"]===true){
f=dm.hideAddressBar;
}
}
_1.connect(null,(_1.global.onorientationchange!==undefined&&!_1.isAndroid)?"onorientationchange":"onresize",null,f);
var _24=_1.body().getElementsByTagName("*");
var i,len=_24.length,s;
for(i=0;i<len;i++){
s=_24[i].getAttribute("__dojoType");
if(s){
_24[i].setAttribute("dojoType",s);
_24[i].removeAttribute("__dojoType");
}
}
if(_1.hash){
var _25=function(_26){
var arr;
arr=dijit.findWidgets(_26);
var _27=arr;
for(var i=0;i<_27.length;i++){
arr=arr.concat(_25(_27[i].containerNode));
}
return arr;
};
_1.subscribe("/dojo/hashchange",null,function(_28){
var _29=dm.currentView;
if(!_29){
return;
}
var _2a=dm._params;
if(!_2a){
var _2b=_28?_28:dm._defaultView.id;
var _2c=_25(_29.domNode);
var dir=1,_2d="slide";
for(i=0;i<_2c.length;i++){
var w=_2c[i];
if("#"+_2b==w.moveTo){
_2d=w.transition;
dir=(w instanceof dm.Heading)?-1:1;
break;
}
}
_2a=[_2b,dir,_2d];
}
_29.performTransition.apply(_29,_2a);
dm._params=null;
});
}
_1.body().style.visibility="visible";
});
dijit.getEnclosingWidget=function(_2e){
while(_2e&&_2e.tagName!=="BODY"){
if(_2e.getAttribute&&_2e.getAttribute("widgetId")){
return dijit.registry.byId(_2e.getAttribute("widgetId"));
}
_2e=_2e._parentNode||_2e.parentNode;
}
return null;
};
_1.extend(dijit._WidgetBase,{_cv:function(s){
return s;
}});
(function(){
if(_1.isWebKit){
dm.hasTouch=(typeof _1.doc.documentElement.ontouchstart!="undefined"&&navigator.appVersion.indexOf("Mobile")!=-1)||!!_1.isAndroid;
}
})();
return dm;
});
