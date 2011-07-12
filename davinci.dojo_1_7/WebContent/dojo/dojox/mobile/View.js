/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/View",["./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./ViewController"],function(_1,_2,_3,_4){
return dojo.declare("dojox.mobile.View",[dijit._WidgetBase,dijit._Container,dijit._Contained],{selected:false,keepScrollPos:true,constructor:function(_5,_6){
if(_6){
dojo.byId(_6).style.visibility="hidden";
}
},buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef||dojo.doc.createElement("DIV");
this.domNode.className="mblView";
if(dojo.config["mblAndroidWorkaround"]!==false&&dojo.isAndroid>=2.2&&dojo.isAndroid<3.1){
if(dojo.isAndroid<3){
dojo.style(this.domNode,"webkitTransform","translate3d(0,0,0)");
this.connect(null,"onfocus",function(e){
dojo.style(this.domNode,"webkitTransform","");
});
this.connect(null,"onblur",function(e){
dojo.style(this.domNode,"webkitTransform","translate3d(0,0,0)");
});
}else{
if(dojo.config["mblAndroid3Workaround"]!==false){
dojo.style(this.domNode,{webkitBackfaceVisibility:"hidden",webkitPerspective:8000});
}
}
}
this.connect(this.domNode,"webkitAnimationEnd","onAnimationEnd");
this.connect(this.domNode,"webkitAnimationStart","onAnimationStart");
var id=location.href.match(/#(\w+)([^\w=]|$)/)?RegExp.$1:null;
this._visible=this.selected&&!id||this.id==id;
if(this.selected){
dojox.mobile._defaultView=this;
}
},startup:function(){
if(this._started){
return;
}
var _7=[];
var _8=this.domNode.parentNode.childNodes;
var _9=false;
for(var i=0;i<_8.length;i++){
var c=_8[i];
if(c.nodeType===1&&dojo.hasClass(c,"mblView")){
_7.push(c);
_9=_9||dijit.byNode(c)._visible;
}
}
var _a=this._visible;
if(_7.length===1||(!_9&&_7[0]===this.domNode)){
_a=true;
}
var _b=this;
setTimeout(function(){
if(!_a){
_b.domNode.style.display="none";
}else{
dojox.mobile.currentView=_b;
_b.onStartView();
dojo.publish("/dojox/mobile/startView",[_b]);
}
if(_b.domNode.style.visibility!="visible"){
_b.domNode.style.visibility="visible";
}
var _c=_b.getParent&&_b.getParent();
if(!_c||!_c.resize){
_b.resize();
}
},dojo.isIE?100:0);
this.inherited(arguments);
},resize:function(){
dojo.forEach(this.getChildren(),function(_d){
if(_d.resize){
_d.resize();
}
});
},onStartView:function(){
},onBeforeTransitionIn:function(_e,_f,_10,_11,_12){
},onAfterTransitionIn:function(_13,dir,_14,_15,_16){
},onBeforeTransitionOut:function(_17,dir,_18,_19,_1a){
},onAfterTransitionOut:function(_1b,dir,_1c,_1d,_1e){
},_saveState:function(_1f,dir,_20,_21,_22){
this._context=_21;
this._method=_22;
if(_20=="none"){
_20=null;
}
this._moveTo=_1f;
this._dir=dir;
this._transition=_20;
this._arguments=dojo._toArray(arguments);
this._args=[];
if(_21||_22){
for(var i=5;i<arguments.length;i++){
this._args.push(arguments[i]);
}
}
},convertToId:function(_23){
if(typeof (_23)=="string"){
_23.match(/^#?([^&]+)/);
return RegExp.$1;
}
return _23;
},performTransition:function(_24,dir,_25,_26,_27){
if(_24==="#"){
return;
}
if(dojo.hash){
if(typeof (_24)=="string"&&_24.charAt(0)=="#"&&!dojox.mobile._params){
dojox.mobile._params=[];
for(var i=0;i<arguments.length;i++){
dojox.mobile._params.push(arguments[i]);
}
dojo.hash(_24);
return;
}
}
this._saveState.apply(this,arguments);
var _28;
if(_24){
_28=this.convertToId(_24);
}else{
if(!this._dummyNode){
this._dummyNode=dojo.doc.createElement("DIV");
dojo.body().appendChild(this._dummyNode);
}
_28=this._dummyNode;
}
var _29=this.domNode;
var _2a=_29.offsetTop;
_28=this.toNode=dojo.byId(_28);
if(!_28){
return;
}
_28.style.visibility="hidden";
_28.style.display="";
var _2b=dijit.byNode(_28);
if(_2b){
dojox.mobile.resizeAll(null,_2b);
if(_25&&_25!="none"){
_2b.containerNode.style.paddingTop=_2a+"px";
}
}
this.onBeforeTransitionOut.apply(this,arguments);
dojo.publish("/dojox/mobile/beforeTransitionOut",[this].concat(dojo._toArray(arguments)));
if(_2b){
if(this.keepScrollPos&&!this.getParent()){
var _2c=dojo.body().scrollTop||dojo.doc.documentElement.scrollTop||dojo.global.pageYOffset||0;
_29._scrollTop=_2c;
var _2d=(dir==1)?0:(_28._scrollTop||0);
_28.style.top="0px";
if(_2c>1||_2d!==0){
_29.style.top=_2d-_2c+"px";
if(dojo.config["mblHideAddressBar"]!==false){
setTimeout(function(){
dojo.global.scrollTo(0,(_2d||1));
},0);
}
}
}else{
_28.style.top="0px";
}
_2b.onBeforeTransitionIn.apply(_2b,arguments);
dojo.publish("/dojox/mobile/beforeTransitionIn",[_2b].concat(dojo._toArray(arguments)));
}
_28.style.display="none";
_28.style.visibility="visible";
this._doTransition(_29,_28,_25,dir);
},_toCls:function(s){
return "mbl"+s.charAt(0).toUpperCase()+s.substring(1);
},_doTransition:function(_2e,_2f,_30,dir){
var rev=(dir==-1)?" mblReverse":"";
_2f.style.display="";
if(!_30||_30=="none"){
this.domNode.style.display="none";
this.invokeCallback();
}else{
var s=this._toCls(_30);
dojo.addClass(_2e,s+" mblOut"+rev);
dojo.addClass(_2f,s+" mblIn"+rev);
var _31="50% 50%";
var _32="50% 50%";
var _33,_34,_35;
if(_30.indexOf("swirl")!=-1||_30.indexOf("zoom")!=-1){
if(this.keepScrollPos&&!this.getParent()){
_33=dojo.body().scrollTop||dojo.doc.documentElement.scrollTop||dojo.global.pageYOffset||0;
}else{
_33=-dojo.position(_2e,true).y;
}
_35=dojo.global.innerHeight/2+_33;
_31="50% "+_35+"px";
_32="50% "+_35+"px";
}else{
if(_30.indexOf("scale")!=-1){
var _36=dojo.position(_2e,true);
_34=((this.clickedPosX!==undefined)?this.clickedPosX:dojo.global.innerWidth/2)-_36.x;
if(this.keepScrollPos&&!this.getParent()){
_33=dojo.body().scrollTop||dojo.doc.documentElement.scrollTop||dojo.global.pageYOffset||0;
}else{
_33=-_36.y;
}
_35=((this.clickedPosY!==undefined)?this.clickedPosY:dojo.global.innerHeight/2)+_33;
_31=_34+"px "+_35+"px";
_32=_34+"px "+_35+"px";
}
}
dojo.style(_2e,{webkitTransformOrigin:_31});
dojo.style(_2f,{webkitTransformOrigin:_32});
}
dojox.mobile.currentView=dijit.byNode(_2f);
},onAnimationStart:function(e){
},onAnimationEnd:function(e){
if(e.animationName.indexOf("Out")===-1&&e.animationName.indexOf("In")===-1&&e.animationName.indexOf("Shrink")===-1){
return;
}
var _37=false;
if(dojo.hasClass(this.domNode,"mblOut")){
_37=true;
this.domNode.style.display="none";
dojo.removeClass(this.domNode,[this._toCls(this._transition),"mblIn","mblOut","mblReverse"]);
}else{
this.containerNode.style.paddingTop="";
}
if(e.animationName.indexOf("Shrink")!==-1){
var li=e.target;
li.style.display="none";
dojo.removeClass(li,"mblCloseContent");
}
if(_37){
this.invokeCallback();
}
this.domNode&&(this.domNode.className="mblView");
this.clickedPosX=this.clickedPosY=undefined;
},invokeCallback:function(){
this.onAfterTransitionOut.apply(this,this._arguments);
dojo.publish("/dojox/mobile/afterTransitionOut",[this].concat(this._arguments));
var _38=dijit.byNode(this.toNode);
if(_38){
_38.onAfterTransitionIn.apply(_38,this._arguments);
dojo.publish("/dojox/mobile/afterTransitionIn",[_38].concat(this._arguments));
}
var c=this._context,m=this._method;
if(!c&&!m){
return;
}
if(!m){
m=c;
c=null;
}
c=c||dojo.global;
if(typeof (m)=="string"){
c[m].apply(c,this._args);
}else{
m.apply(c,this._args);
}
},getShowingView:function(){
var _39=this.domNode.parentNode.childNodes;
for(var i=0;i<_39.length;i++){
if(dojo.hasClass(_39[i],"mblView")&&dojo.style(_39[i],"display")!="none"){
return dijit.byNode(_39[i]);
}
}
return null;
},show:function(){
var _3a=this.getShowingView();
if(_3a){
_3a.domNode.style.display="none";
}
this.domNode.style.display="";
dojox.mobile.currentView=this;
}});
});
