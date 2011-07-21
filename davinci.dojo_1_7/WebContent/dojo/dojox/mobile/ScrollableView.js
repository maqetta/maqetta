/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ScrollableView",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","./View","./_ScrollableMixin"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.mobile.ScrollableView",[dojox.mobile.View,dojox.mobile._ScrollableMixin],{scrollableParams:{noResize:true},buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"mblScrollableView");
this.domNode.style.overflow="hidden";
this.domNode.style.top="0px";
this.containerNode=_1.create("DIV",{className:"mblScrollableViewContainer"},this.domNode);
this.containerNode.style.position="absolute";
this.containerNode.style.top="0px";
if(this.scrollDir==="v"){
this.containerNode.style.width="100%";
}
this.reparent();
this.findAppBars();
},resize:function(){
this.inherited(arguments);
_1.forEach(this.getChildren(),function(_7){
if(_7.resize){
_7.resize();
}
});
},isTopLevel:function(e){
var _8=this.getParent&&this.getParent();
return (!_8||!_8.resize);
},addChild:function(_9, insertIndex){
var c=_9.domNode;
var _a=this.checkFixedBar(c,true);
if(_a){
this.domNode.appendChild(c);
if(_a==="top"){
this.fixedHeaderHeight=c.offsetHeight;
this.isLocalHeader=true;
}else{
if(_a==="bottom"){
this.fixedFooterHeight=c.offsetHeight;
this.isLocalFooter=true;
c.style.bottom="0px";
}
}
this.resize();
				if(this._started && !_9._started){
					_9.startup();
				}
}else{
				this.inherited(arguments);
}
},reparent:function(){
var i,_b,_c,c;
for(i=0,_b=0,_c=this.domNode.childNodes.length;i<_c;i++){
c=this.domNode.childNodes[_b];
if(c===this.containerNode||this.checkFixedBar(c,true)){
_b++;
continue;
}
this.containerNode.appendChild(this.domNode.removeChild(c));
}
},onAfterTransitionIn:function(_d,_e,_f,_10,_11){
this.flashScrollBar();
},getChildren:function(){
var _12=this.inherited(arguments);
if(this.fixedHeader&&this.fixedHeader.parentNode===this.domNode){
_12.push(dijit.byNode(this.fixedHeader));
}
if(this.fixedFooter&&this.fixedFooter.parentNode===this.domNode){
_12.push(dijit.byNode(this.fixedFooter));
}
return _12;
}});
});
