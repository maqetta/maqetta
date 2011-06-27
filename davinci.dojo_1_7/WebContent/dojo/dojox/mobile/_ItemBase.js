/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_ItemBase",["./common","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./ProgressIndicator","./TransitionEvent"],function(_1,_2,_3,_4,_5,_6){
return dojo.declare("dojox.mobile._ItemBase",[dijit._WidgetBase,dijit._Container,dijit._Contained],{icon:"",iconPos:"",alt:"",href:"",hrefTarget:"",moveTo:"",scene:"",clickable:false,url:"",urlTarget:"",transition:"",transitionDir:1,transitionOptions:null,callback:null,sync:true,label:"",toggle:false,_duration:800,inheritParams:function(){
var _7=this.getParent();
if(_7){
if(!this.transition){
this.transition=_7.transition;
}
if(this.icon&&_7.iconBase&&_7.iconBase.charAt(_7.iconBase.length-1)==="/"){
this.icon=_7.iconBase+this.icon;
}
if(!this.icon){
this.icon=_7.iconBase;
}
if(!this.iconPos){
this.iconPos=_7.iconPos;
}
}
},select:function(_8){
},defaultClickAction:function(e){
if(this.toggle){
this.select(this.selected);
}else{
if(!this.selected){
this.select();
if(!this.selectOne){
var _9=this;
setTimeout(function(){
_9.select(true);
},this._duration);
}
var _a;
if(this.moveTo||this.href||this.url||this.scene){
_a={moveTo:this.moveTo,href:this.href,url:this.url,scene:this.scene,transition:this.transition,transitionDir:this.transitionDir};
}else{
if(this.transitionOptions){
_a=this.transitionOptions;
}
}
if(_a){
return new _6(this.domNode,_a,e).dispatch();
}
}
}
},getParent:function(){
var _b=this.srcNodeRef||this.domNode;
return _b&&_b.parentNode?dijit.getEnclosingWidget(_b.parentNode):null;
},setTransitionPos:function(e){
var w=this;
while(true){
w=w.getParent();
if(!w||w instanceof dojox.mobile.View){
break;
}
}
if(w){
w.clickedPosX=e.clientX;
w.clickedPosY=e.clientY;
}
},transitionTo:function(_c,_d,_e,_f){
if(dojo.config.isDebug){
var _10=arguments.callee._ach||(arguments.callee._ach={}),_11=(arguments.callee.caller||"unknown caller").toString();
if(!_10[_11]){
dojo.deprecated(this.declaredClass+"::transitionTo() is deprecated."+_11,"","2.0");
_10[_11]=true;
}
}
new _6(this.domNode,{moveTo:_c,href:_d,url:_e,scene:_f,transition:this.transition,transitionDir:this.transitionDir}).dispatch();
}});
});
