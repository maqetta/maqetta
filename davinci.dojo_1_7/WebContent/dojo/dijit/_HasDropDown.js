/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_HasDropDown",["dojo/_base/kernel",".","dojo/has","dojo/touch","./focus","./popup","./_FocusMixin","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/window","dojo/window"],function(_1,_2,_3,_4,_5,_6){
_1.declare("dijit._HasDropDown",_2._FocusMixin,{_buttonNode:null,_arrowWrapperNode:null,_popupStateNode:null,_aroundNode:null,dropDown:null,autoWidth:true,forceWidth:false,maxHeight:0,dropDownPosition:["below","above"],_stopClickEvents:true,_onDropDownMouseDown:function(e){
if(this.disabled||this.readOnly){
return;
}
_1.stopEvent(e);
this._docHandler=this.connect(_1.doc,_4.release,"_onDropDownMouseUp");
this.toggleDropDown();
},_onDropDownMouseUp:function(e){
if(e&&this._docHandler){
this.disconnect(this._docHandler);
}
var _7=this.dropDown,_8=false;
if(e&&this._opened){
var c=_1.position(this._buttonNode,true);
if(!(e.pageX>=c.x&&e.pageX<=c.x+c.w)||!(e.pageY>=c.y&&e.pageY<=c.y+c.h)){
var t=e.target;
while(t&&!_8){
if(_1.hasClass(t,"dijitPopup")){
_8=true;
}else{
t=t.parentNode;
}
}
if(_8){
t=e.target;
if(_7.onItemClick){
var _9;
while(t&&!(_9=_2.byNode(t))){
t=t.parentNode;
}
if(_9&&_9.onClick&&_9.getParent){
_9.getParent().onItemClick(_9,e);
}
}
return;
}
}
}
if(this._opened){
if(_7.focus&&_7.autoFocus!==false){
window.setTimeout(_1.hitch(_7,"focus"),1);
}
}else{
setTimeout(_1.hitch(this,"focus"),0);
}
if(_3("ios")){
this._justGotMouseUp=true;
setTimeout(_1.hitch(this,function(){
this._justGotMouseUp=false;
}),0);
}
},_onDropDownClick:function(e){
if(_3("ios")&&!this._justGotMouseUp){
this._onDropDownMouseDown(e);
this._onDropDownMouseUp(e);
}
if(this._stopClickEvents){
_1.stopEvent(e);
}
},buildRendering:function(){
this.inherited(arguments);
this._buttonNode=this._buttonNode||this.focusNode||this.domNode;
this._popupStateNode=this._popupStateNode||this.focusNode||this._buttonNode;
var _a={"after":this.isLeftToRight()?"Right":"Left","before":this.isLeftToRight()?"Left":"Right","above":"Up","below":"Down","left":"Left","right":"Right"}[this.dropDownPosition[0]]||this.dropDownPosition[0]||"Down";
_1.addClass(this._arrowWrapperNode||this._buttonNode,"dijit"+_a+"ArrowButton");
},postCreate:function(){
this.inherited(arguments);
this.connect(this._buttonNode,_4.press,"_onDropDownMouseDown");
this.connect(this._buttonNode,"onclick","_onDropDownClick");
this.connect(this.focusNode,"onkeypress","_onKey");
this.connect(this.focusNode,"onkeyup","_onKeyUp");
},destroy:function(){
if(this.dropDown){
if(!this.dropDown._destroyed){
this.dropDown.destroyRecursive();
}
delete this.dropDown;
}
this.inherited(arguments);
},_onKey:function(e){
if(this.disabled||this.readOnly){
return;
}
var d=this.dropDown,_b=e.target;
if(d&&this._opened&&d.handleKey){
if(d.handleKey(e)===false){
_1.stopEvent(e);
return;
}
}
if(d&&this._opened&&e.charOrCode==_1.keys.ESCAPE){
this.closeDropDown();
_1.stopEvent(e);
}else{
if(!this._opened&&(e.charOrCode==_1.keys.DOWN_ARROW||((e.charOrCode==_1.keys.ENTER||e.charOrCode==" ")&&((_b.tagName||"").toLowerCase()!=="input"||(_b.type&&_b.type.toLowerCase()!=="text"))))){
this._toggleOnKeyUp=true;
_1.stopEvent(e);
}
}
},_onKeyUp:function(){
if(this._toggleOnKeyUp){
delete this._toggleOnKeyUp;
this.toggleDropDown();
var d=this.dropDown;
if(d&&d.focus){
setTimeout(_1.hitch(d,"focus"),1);
}
}
},_onBlur:function(){
var _c=_5.curNode&&this.dropDown&&_1.isDescendant(_5.curNode,this.dropDown.domNode);
this.closeDropDown(_c);
this.inherited(arguments);
},isLoaded:function(){
return true;
},loadDropDown:function(_d){
_d();
},toggleDropDown:function(){
if(this.disabled||this.readOnly){
return;
}
if(!this._opened){
if(!this.isLoaded()){
this.loadDropDown(_1.hitch(this,"openDropDown"));
}else{
this.openDropDown();
}
}else{
this.closeDropDown();
}
},openDropDown:function(){
var _e=this.dropDown,_f=_e.domNode,_10=this._aroundNode||this.domNode,_11=this;
if(!this._preparedNode){
this._preparedNode=true;
if(_f.style.width){
this._explicitDDWidth=true;
}
if(_f.style.height){
this._explicitDDHeight=true;
}
}
if(this.maxHeight||this.forceWidth||this.autoWidth){
var _12={display:"",visibility:"hidden"};
if(!this._explicitDDWidth){
_12.width="";
}
if(!this._explicitDDHeight){
_12.height="";
}
_1.style(_f,_12);
var _13=this.maxHeight;
if(_13==-1){
var _14=_1.window.getBox(),_15=_1.position(_10,false);
_13=Math.floor(Math.max(_15.y,_14.h-(_15.y+_15.h)));
}
_6.moveOffScreen(_e);
if(_e.startup&&!_e._started){
_e.startup();
}
var mb=_1._getMarginSize(_f);
var _16=(_13&&mb.h>_13);
_1.style(_f,{overflowX:"hidden",overflowY:_16?"auto":"hidden"});
if(_16){
mb.h=_13;
if("w" in mb){
mb.w+=16;
}
}else{
delete mb.h;
}
if(this.forceWidth){
mb.w=_10.offsetWidth;
}else{
if(this.autoWidth){
mb.w=Math.max(mb.w,_10.offsetWidth);
}else{
delete mb.w;
}
}
if(_1.isFunction(_e.resize)){
_e.resize(mb);
}else{
_1.marginBox(_f,mb);
}
}
var _17=_6.open({parent:this,popup:_e,around:_10,orient:this.dropDownPosition,onExecute:function(){
_11.closeDropDown(true);
},onCancel:function(){
_11.closeDropDown(true);
},onClose:function(){
_1.attr(_11._popupStateNode,"popupActive",false);
_1.removeClass(_11._popupStateNode,"dijitHasDropDownOpen");
_11._opened=false;
}});
_1.attr(this._popupStateNode,"popupActive","true");
_1.addClass(_11._popupStateNode,"dijitHasDropDownOpen");
this._opened=true;
return _17;
},closeDropDown:function(_18){
if(this._opened){
if(_18){
this.focus();
}
_6.close(this.dropDown);
this._opened=false;
}
}});
return _2._HasDropDown;
});
