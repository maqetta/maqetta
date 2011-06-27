/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/ToggleSplitter",["dojo","dijit","dojox","dijit/layout/BorderContainer"],function(_1,_2,_3){
_1.getObject("dojox.layout.ToggleSplitter",1);
define("dojox/layout/ToggleSplitter",["dojo","dijit"],function(_4,_5){
_4.experimental("dojox.layout.ToggleSplitter");
_4.declare("dojox.layout.ToggleSplitter",_5.layout._Splitter,{state:"full",_closedSize:"0",baseClass:"dojoxToggleSplitter",templateString:"<div class=\"dijitSplitter dojoxToggleSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\">"+"<div dojoAttachPoint=\"toggleNode\" class=\"dijitSplitterThumb dojoxToggleSplitterIcon\" tabIndex=\"0\" role=\"separator\" "+"dojoAttachEvent=\"onmousedown:_onToggleNodeMouseDown,onclick:_toggle,onmouseenter:_onToggleNodeMouseMove,onmouseleave:_onToggleNodeMouseMove,onfocus:_onToggleNodeMouseMove,onblur:_onToggleNodeMouseMove\">"+"<span class=\"dojoxToggleSplitterA11y\" dojoAttachPoint=\"a11yText\"></span></div>"+"</div>",postCreate:function(){
this.inherited(arguments);
var _6=this.region;
_4.addClass(this.domNode,this.baseClass+_6.charAt(0).toUpperCase()+_6.substring(1));
},startup:function(){
this.inherited(arguments);
var _7=this.child,_8=this.child.domNode,_9=_4.style(_8,(this.horizontal?"height":"width"));
this.domNode.setAttribute("aria-controls",_8.id);
_4.forEach(["toggleSplitterState","toggleSplitterFullSize","toggleSplitterCollapsedSize"],function(_a){
var _b=_a.substring("toggleSplitter".length);
_b=_b.charAt(0).toLowerCase()+_b.substring(1);
if(_a in this.child){
this[_b]=this.child[_a];
}
},this);
if(!this.fullSize){
this.fullSize=this.state=="full"?_9+"px":"75px";
}
this._openStyleProps=this._getStyleProps(_8,"full");
this._started=true;
this.set("state",this.state);
return this;
},_onKeyPress:function(_c){
if(this.state=="full"){
this.inherited(arguments);
}
if(_c.charCode==_4.keys.SPACE||_c.keyCode==_4.keys.ENTER){
this._toggle(_c);
}
},_onToggleNodeMouseDown:function(_d){
_4.stopEvent(_d);
this.toggleNode.focus();
},_startDrag:function(e){
if(this.state=="full"){
this.inherited(arguments);
}
},_stopDrag:function(e){
this.inherited(arguments);
this.toggleNode.blur();
},_toggle:function(_e){
var _f;
switch(this.state){
case "full":
_f=this.collapsedSize?"collapsed":"closed";
break;
case "collapsed":
_f="closed";
break;
default:
_f="full";
}
this.set("state",_f);
},_onToggleNodeMouseMove:function(evt){
var _10=this.baseClass,_11=this.toggleNode,on=this.state=="full"||this.state=="collapsed",_12=evt.type=="mouseout"||evt.type=="blur";
_4.toggleClass(_11,_10+"IconOpen",_12&&on);
_4.toggleClass(_11,_10+"IconOpenHover",!_12&&on);
_4.toggleClass(_11,_10+"IconClosed",_12&&!on);
_4.toggleClass(_11,_10+"IconClosedHover",!_12&&!on);
},_handleOnChange:function(_13){
var _14=this.child.domNode,_15,_16,dim=this.horizontal?"height":"width";
if(this.state=="full"){
var _17=_4.mixin({display:"block",overflow:"auto",visibility:"visible"},this._openStyleProps);
_17[dim]=(this._openStyleProps&&this._openStyleProps[dim])?this._openStyleProps[dim]:this.fullSize;
_4.style(this.domNode,"cursor","");
_4.style(_14,_17);
}else{
if(this.state=="collapsed"){
_16=_4.getComputedStyle(_14);
_15=this._getStyleProps(_14,"full",_16);
this._openStyleProps=_15;
_4.style(this.domNode,"cursor","auto");
_4.style(_14,dim,this.collapsedSize);
}else{
if(!this.collapsedSize){
_16=_4.getComputedStyle(_14);
_15=this._getStyleProps(_14,"full",_16);
this._openStyleProps=_15;
}
var _18=this._getStyleProps(_14,"closed",_16);
_4.style(this.domNode,"cursor","auto");
_4.style(_14,_18);
}
}
this._setStateClass();
if(this.container._started){
this.container._layoutChildren(this.region);
}
},_getStyleProps:function(_19,_1a,_1b){
if(!_1b){
_1b=_4.getComputedStyle(_19);
}
var _1c={},dim=this.horizontal?"height":"width";
_1c["overflow"]=(_1a!="closed")?_1b["overflow"]:"hidden";
_1c["visibility"]=(_1a!="closed")?_1b["visibility"]:"hidden";
_1c[dim]=(_1a!="closed")?_19.style[dim]||_1b[dim]:this._closedSize;
var _1d=["Top","Right","Bottom","Left"];
_4.forEach(["padding","margin","border"],function(_1e){
for(var i=0;i<_1d.length;i++){
var _1f=_1e+_1d[i];
if(_1e=="border"){
_1f+="Width";
}
if(undefined!==_1b[_1f]){
_1c[_1f]=(_1a!="closed")?_1b[_1f]:0;
}
}
});
return _1c;
},_setStateClass:function(){
var _20="&#9652",_21=this.region.toLowerCase(),_22=this.baseClass,_23=this.toggleNode,on=this.state=="full"||this.state=="collapsed",_24=this.focused;
_4.toggleClass(_23,_22+"IconOpen",on&&!_24);
_4.toggleClass(_23,_22+"IconClosed",!on&&!_24);
_4.toggleClass(_23,_22+"IconOpenHover",on&&_24);
_4.toggleClass(_23,_22+"IconClosedHover",!on&&_24);
if(_21=="top"&&on||_21=="bottom"&&!on){
_20="&#9650";
}else{
if(_21=="top"&&!on||_21=="bottom"&&on){
_20="&#9660";
}else{
if(_21=="right"&&on||_21=="left"&&!on){
_20="&#9654";
}else{
if(_21=="right"&&!on||_21=="left"&&on){
_20="&#9664";
}
}
}
}
this.a11yText.innerHTML=_20;
},_setStateAttr:function(_25){
if(!this._started){
return;
}
var _26=this.state;
this.state=_25;
this._handleOnChange(_26);
var _27;
switch(_25){
case "full":
this.domNode.setAttribute("aria-expanded",true);
_27="onOpen";
break;
case "collapsed":
this.domNode.setAttribute("aria-expanded",true);
_27="onCollapsed";
break;
default:
this.domNode.setAttribute("aria-expanded",false);
_27="onClosed";
}
this[_27](this.child);
},onOpen:function(_28){
},onCollapsed:function(_29){
},onClosed:function(_2a){
}});
_4.extend(_5._Widget,{toggleSplitterState:"full",toggleSplitterFullSize:"",toggleSplitterCollapsedSize:""});
});
return _1.getObject("dojox.layout.ToggleSplitter");
});
require(["dojox/layout/ToggleSplitter"]);
