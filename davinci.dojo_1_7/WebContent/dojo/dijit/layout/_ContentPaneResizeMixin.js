/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/_ContentPaneResizeMixin",["dojo/_base/kernel","..","../_Contained","./_LayoutWidget","dojo/_base/NodeList","dojo/_base/array","dojo/_base/html","dojo/_base/sniff","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit.layout._ContentPaneResizeMixin",null,{doLayout:true,isContainer:true,isLayoutContainer:true,_startChildren:function(){
_1.forEach(this.getChildren(),function(_3){
if(!_3._started){
_3.startup();
_3._started=true;
}
});
},startup:function(){
if(this._started){
return;
}
var _4=_2._Contained.prototype.getParent.call(this);
this._childOfLayoutWidget=_4&&_4.isLayoutContainer;
this._needLayout=!this._childOfLayoutWidget;
this.inherited(arguments);
this._startChildren();
if(this._isShown()){
this._onShow();
}
if(!this._childOfLayoutWidget){
this.connect(_1.isIE?this.domNode:_1.global,"onresize",function(){
this._needLayout=!this._childOfLayoutWidget;
this.resize();
});
}
},_checkIfSingleChild:function(){
var _5=_1.query("> *",this.containerNode).filter(function(_6){
return _6.tagName!=="SCRIPT";
}),_7=_5.filter(function(_8){
return _1.hasAttr(_8,"data-dojo-type")||_1.hasAttr(_8,"dojoType")||_1.hasAttr(_8,"widgetId");
}),_9=_1.filter(_7.map(_2.byNode),function(_a){
return _a&&_a.domNode&&_a.resize;
});
if(_5.length==_7.length&&_9.length==1){
this._singleChild=_9[0];
}else{
delete this._singleChild;
}
_1.toggleClass(this.containerNode,this.baseClass+"SingleChild",!!this._singleChild);
},resize:function(_b,_c){
if(!this._wasShown&&this.open!==false){
this._onShow();
}
this._resizeCalled=true;
this._scheduleLayout(_b,_c);
},_scheduleLayout:function(_d,_e){
if(this._isShown()){
this._layout(_d,_e);
}else{
this._needLayout=true;
this._changeSize=_d;
this._resultSize=_e;
}
},_layout:function(_f,_10){
if(_f){
_1.marginBox(this.domNode,_f);
}
var cn=this.containerNode;
if(cn===this.domNode){
var mb=_10||{};
_1.mixin(mb,_f||{});
if(!("h" in mb)||!("w" in mb)){
mb=_1.mixin(_1.marginBox(cn),mb);
}
this._contentBox=_2.layout.marginBox2contentBox(cn,mb);
}else{
this._contentBox=_1.contentBox(cn);
}
this._layoutChildren();
delete this._needLayout;
},_layoutChildren:function(){
if(this.doLayout){
this._checkIfSingleChild();
}
if(this._singleChild&&this._singleChild.resize){
var cb=this._contentBox||_1.contentBox(this.containerNode);
this._singleChild.resize({w:cb.w,h:cb.h});
}else{
_1.forEach(this.getChildren(),function(_11){
if(_11.resize){
_11.resize();
}
});
}
},_isShown:function(){
if(this._childOfLayoutWidget){
if(this._resizeCalled&&"open" in this){
return this.open;
}
return this._resizeCalled;
}else{
if("open" in this){
return this.open;
}else{
var _12=this.domNode,_13=this.domNode.parentNode;
return (_12.style.display!="none")&&(_12.style.visibility!="hidden")&&!_1.hasClass(_12,"dijitHidden")&&_13&&_13.style&&(_13.style.display!="none");
}
}
},_onShow:function(){
if(this._needLayout){
this._layout(this._changeSize,this._resultSize);
}
this.inherited(arguments);
this._wasShown=true;
}});
return _2.layout._ContentPaneResizeMixin;
});
