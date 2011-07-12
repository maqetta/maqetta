/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_compat",["dojo/_base/kernel","./common","dojo/uacss","dojo/_base/fx","dojo/fx","dojo/fx/easing","dojox/fx","dojox/fx/flip"],function(_1,_2,_3,_4,fx,_5,_6,_7){
if(!_1.isWebKit){
if(dojox.mobile.View){
_1.extend(dojox.mobile.View,{_doTransition:function(_8,_9,_a,_b){
var _c;
this.wakeUp(_9);
if(!_a||_a=="none"){
_9.style.display="";
_8.style.display="none";
_9.style.left="0px";
this.invokeCallback();
}else{
if(_a=="slide"||_a=="cover"||_a=="reveal"){
var w=_8.offsetWidth;
var s1=_1.fx.slideTo({node:_8,duration:400,left:-w*_b,top:_1.style(_8,"top")});
var s2=_1.fx.slideTo({node:_9,duration:400,left:0,top:_1.style(_9,"top")});
_9.style.position="absolute";
_9.style.left=w*_b+"px";
_9.style.display="";
_c=_1.fx.combine([s1,s2]);
_1.connect(_c,"onEnd",this,function(){
_8.style.display="none";
_8.style.left="0px";
_9.style.position="relative";
var _d=dijit.byNode(_9);
if(_d&&!_1.hasClass(_d.domNode,"out")){
_d.containerNode.style.paddingTop="";
}
this.invokeCallback();
});
_c.play();
}else{
if(_a=="slidev"||_a=="coverv"||_a=="reavealv"){
var h=_8.offsetHeight;
var s1=_1.fx.slideTo({node:_8,duration:400,left:0,top:-h*_b});
var s2=_1.fx.slideTo({node:_9,duration:400,left:0,top:0});
_9.style.position="absolute";
_9.style.top=h*_b+"px";
_9.style.left="0px";
_9.style.display="";
_c=_1.fx.combine([s1,s2]);
_1.connect(_c,"onEnd",this,function(){
_8.style.display="none";
_9.style.position="relative";
this.invokeCallback();
});
_c.play();
}else{
if(_a=="flip"||_a=="flip2"){
_c=dojox.fx.flip({node:_8,dir:"right",depth:0.5,duration:400});
_9.style.position="absolute";
_9.style.left="0px";
_1.connect(_c,"onEnd",this,function(){
_8.style.display="none";
_9.style.position="relative";
_9.style.display="";
this.invokeCallback();
});
_c.play();
}else{
_c=_1.fx.chain([_1.fadeOut({node:_8,duration:600}),_1.fadeIn({node:_9,duration:600})]);
_9.style.position="absolute";
_9.style.left="0px";
_9.style.display="";
_1.style(_9,"opacity",0);
_1.connect(_c,"onEnd",this,function(){
_8.style.display="none";
_9.style.position="relative";
_1.style(_8,"opacity",1);
this.invokeCallback();
});
_c.play();
}
}
}
}
dojox.mobile.currentView=dijit.byNode(_9);
},wakeUp:function(_e){
if(_1.isIE&&!_e._wokeup){
_e._wokeup=true;
var _f=_e.style.display;
_e.style.display="";
var _10=_e.getElementsByTagName("*");
for(var i=0,len=_10.length;i<len;i++){
var val=_10[i].style.display;
_10[i].style.display="none";
_10[i].style.display="";
_10[i].style.display=val;
}
_e.style.display=_f;
}
}});
}
if(dojox.mobile.Switch){
_1.extend(dojox.mobile.Switch,{_changeState:function(_11,_12){
var on=(_11==="on");
var pos;
if(!on){
pos=-this.inner.firstChild.firstChild.offsetWidth;
}else{
pos=0;
}
this.left.style.display="";
this.right.style.display="";
var _13=this;
var f=function(){
_1.removeClass(_13.domNode,on?"mblSwitchOff":"mblSwitchOn");
_1.addClass(_13.domNode,on?"mblSwitchOn":"mblSwitchOff");
_13.left.style.display=on?"":"none";
_13.right.style.display=!on?"":"none";
};
if(_12){
var a=_1.fx.slideTo({node:this.inner,duration:300,left:pos,onEnd:f});
a.play();
}else{
if(on||pos){
this.inner.style.left=pos+"px";
}
f();
}
}});
}
if(_1.isIE){
if(dojox.mobile.RoundRect){
_1.extend(dojox.mobile.RoundRect,{buildRendering:function(){
dojox.mobile.createRoundRect(this);
this.domNode.className="mblRoundRect";
}});
}
if(dojox.mobile.RoundRectList){
dojox.mobile.RoundRectList._addChild=dojox.mobile.RoundRectList.prototype.addChild;
_1.extend(dojox.mobile.RoundRectList,{buildRendering:function(){
dojox.mobile.createRoundRect(this,true);
this.domNode.className="mblRoundRectList";
},postCreate:function(){
this.redrawBorders();
},addChild:function(_14){
dojox.mobile.RoundRectList._addChild.apply(this,arguments);
this.redrawBorders();
if(dojox.mobile.applyPngFilter){
dojox.mobile.applyPngFilter(_14.domNode);
}
},redrawBorders:function(){
if(this instanceof dojox.mobile.EdgeToEdgeList){
return;
}
var _15=false;
for(var i=this.containerNode.childNodes.length-1;i>=0;i--){
var c=this.containerNode.childNodes[i];
if(c.tagName=="LI"){
c.style.borderBottomStyle=_15?"solid":"none";
_15=true;
}
}
}});
}
if(dojox.mobile.EdgeToEdgeList){
_1.extend(dojox.mobile.EdgeToEdgeList,{buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||_1.doc.createElement("UL");
this.domNode.className="mblEdgeToEdgeList";
}});
}
if(dojox.mobile.IconContainer){
dojox.mobile.IconContainer._addChild=dojox.mobile.IconContainer.prototype.addChild;
_1.extend(dojox.mobile.IconContainer,{addChild:function(_16){
dojox.mobile.IconContainer._addChild.apply(this,arguments);
if(dojox.mobile.applyPngFilter){
dojox.mobile.applyPngFilter(_16.domNode);
}
}});
}
_1.mixin(dojox.mobile,{createRoundRect:function(_17,_18){
var i,len;
_17.domNode=_1.doc.createElement("DIV");
_17.domNode.style.padding="0px";
_17.domNode.style.backgroundColor="transparent";
_17.domNode.style.borderStyle="none";
_17.containerNode=_1.doc.createElement(_18?"UL":"DIV");
_17.containerNode.className="mblRoundRectContainer";
if(_17.srcNodeRef){
_17.srcNodeRef.parentNode.replaceChild(_17.domNode,_17.srcNodeRef);
for(i=0,len=_17.srcNodeRef.childNodes.length;i<len;i++){
_17.containerNode.appendChild(_17.srcNodeRef.removeChild(_17.srcNodeRef.firstChild));
}
_17.srcNodeRef=null;
}
_17.domNode.appendChild(_17.containerNode);
for(i=0;i<=5;i++){
var top=_1.create("DIV");
top.className="mblRoundCorner mblRoundCorner"+i+"T";
_17.domNode.insertBefore(top,_17.containerNode);
var _19=_1.create("DIV");
_19.className="mblRoundCorner mblRoundCorner"+i+"B";
_17.domNode.appendChild(_19);
}
}});
if(dojox.mobile.ScrollableView){
_1.extend(dojox.mobile.ScrollableView,{postCreate:function(){
var _1a=_1.create("DIV",{className:"mblDummyForIE",innerHTML:"&nbsp;"},this.containerNode,"first");
_1.style(_1a,{position:"relative",marginBottom:"-2px",fontSize:"1px"});
}});
}
}
if(_1.isIE<=6){
dojox.mobile.applyPngFilter=function(_1b){
_1b=_1b||_1.body();
var _1c=_1b.getElementsByTagName("IMG");
var _1d=_1.moduleUrl("dojo","resources/blank.gif");
for(var i=0,len=_1c.length;i<len;i++){
var img=_1c[i];
var w=img.offsetWidth;
var h=img.offsetHeight;
if(w===0||h===0){
if(_1.style(img,"display")!="none"){
continue;
}
img.style.display="";
w=img.offsetWidth;
h=img.offsetHeight;
img.style.display="none";
if(w===0||h===0){
continue;
}
}
var src=img.src;
if(src.indexOf("resources/blank.gif")!=-1){
continue;
}
img.src=_1d;
img.runtimeStyle.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+src+"')";
img.style.width=w+"px";
img.style.height=h+"px";
}
};
}
dojox.mobile.loadCssFile=function(_1e){
if(_1.doc.createStyleSheet){
setTimeout(function(_1f){
return function(){
_1.doc.createStyleSheet(_1f);
};
}(_1e),0);
}else{
_1.create("LINK",{href:_1e,type:"text/css",rel:"stylesheet"},_1.doc.getElementsByTagName("head")[0]);
}
};
dojox.mobile.loadCss=function(_20){
if(!_1.global._loadedCss){
var obj={};
_1.forEach(dojox.mobile.getCssPaths(),function(_21){
obj[_21]=true;
});
_1.global._loadedCss=obj;
}
if(!_1.isArray(_20)){
_20=[_20];
}
for(var i=0;i<_20.length;i++){
var _22=_20[i];
if(!_1.global._loadedCss[_22]){
_1.global._loadedCss[_22]=true;
dojox.mobile.loadCssFile(_22);
}
}
};
dojox.mobile.getCssPaths=function(){
var _23=[];
var i,j,len;
var s=_1.doc.styleSheets;
for(i=0;i<s.length;i++){
if(s[i].href){
continue;
}
var r=s[i].cssRules||s[i].imports;
if(!r){
continue;
}
for(j=0;j<r.length;j++){
if(r[j].href){
_23.push(r[j].href);
}
}
}
var _24=_1.doc.getElementsByTagName("link");
for(i=0,len=_24.length;i<len;i++){
if(_24[i].href){
_23.push(_24[i].href);
}
}
return _23;
};
dojox.mobile.loadCompatPattern=/\/mobile\/themes\/.*\.css$/;
dojox.mobile.loadCompatCssFiles=function(){
var _25=dojox.mobile.getCssPaths();
for(var i=0;i<_25.length;i++){
var _26=_25[i];
if((_26.match(dojox.mobile.loadCompatPattern)||location.href.indexOf("mobile/tests/"))&&_26.indexOf("-compat.css")==-1){
var _27=_26.substring(0,_26.length-4)+"-compat.css";
dojox.mobile.loadCss(_27);
}
}
};
dojox.mobile.hideAddressBar=function(evt,_28){
if(_28!==false){
dojox.mobile.resizeAll();
}
};
_1.addOnLoad(function(){
if(_1.config["mblLoadCompatCssFiles"]!==false){
setTimeout(function(){
dojox.mobile.loadCompatCssFiles();
},0);
}
if(dojox.mobile.applyPngFilter){
dojox.mobile.applyPngFilter();
}
});
}
return dojox.mobile.compat;
});
