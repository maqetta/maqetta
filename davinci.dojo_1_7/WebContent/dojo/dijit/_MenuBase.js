/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_MenuBase",["dojo/_base/kernel",".","./popup","dojo/window","./_Widget","./_FocusMixin","./_KeyNavContainer","./_TemplatedMixin","dojo/_base/html","dojo/_base/lang","dojo/_base/array"],function(_1,_2,pm){
_1.declare("dijit._MenuBase",[_2._Widget,_2._TemplatedMixin,_2._KeyNavContainer],{parentMenu:null,popupDelay:500,onExecute:function(){
},onCancel:function(_3){
},_moveToPopup:function(_4){
if(this.focusedChild&&this.focusedChild.popup&&!this.focusedChild.disabled){
this.focusedChild._onClick(_4);
}else{
var _5=this._getTopMenu();
if(_5&&_5._isMenuBar){
_5.focusNext();
}
}
},_onPopupHover:function(_6){
if(this.currentPopup&&this.currentPopup._pendingClose_timer){
var _7=this.currentPopup.parentMenu;
if(_7.focusedChild){
_7.focusedChild._setSelected(false);
}
_7.focusedChild=this.currentPopup.from_item;
_7.focusedChild._setSelected(true);
this._stopPendingCloseTimer(this.currentPopup);
}
},onItemHover:function(_8){
if(this.isActive){
this.focusChild(_8);
if(this.focusedChild.popup&&!this.focusedChild.disabled&&!this.hover_timer){
this.hover_timer=setTimeout(_1.hitch(this,"_openPopup"),this.popupDelay);
}
}
if(this.focusedChild){
this.focusChild(_8);
}
this._hoveredChild=_8;
},_onChildBlur:function(_9){
this._stopPopupTimer();
_9._setSelected(false);
var _a=_9.popup;
if(_a){
this._stopPendingCloseTimer(_a);
_a._pendingClose_timer=setTimeout(function(){
_a._pendingClose_timer=null;
if(_a.parentMenu){
_a.parentMenu.currentPopup=null;
}
pm.close(_a);
},this.popupDelay);
}
},onItemUnhover:function(_b){
if(this.isActive){
this._stopPopupTimer();
}
if(this._hoveredChild==_b){
this._hoveredChild=null;
}
},_stopPopupTimer:function(){
if(this.hover_timer){
clearTimeout(this.hover_timer);
this.hover_timer=null;
}
},_stopPendingCloseTimer:function(_c){
if(_c._pendingClose_timer){
clearTimeout(_c._pendingClose_timer);
_c._pendingClose_timer=null;
}
},_stopFocusTimer:function(){
if(this._focus_timer){
clearTimeout(this._focus_timer);
this._focus_timer=null;
}
},_getTopMenu:function(){
for(var _d=this;_d.parentMenu;_d=_d.parentMenu){
}
return _d;
},onItemClick:function(_e,_f){
if(typeof this.isShowingNow=="undefined"){
this._markActive();
}
this.focusChild(_e);
if(_e.disabled){
return false;
}
if(_e.popup){
this._openPopup();
}else{
this.onExecute();
_e.onClick(_f);
}
},_openPopup:function(){
this._stopPopupTimer();
var _10=this.focusedChild;
if(!_10){
return;
}
var _11=_10.popup;
if(_11.isShowingNow){
return;
}
if(this.currentPopup){
this._stopPendingCloseTimer(this.currentPopup);
pm.close(this.currentPopup);
}
_11.parentMenu=this;
_11.from_item=_10;
var _12=this;
pm.open({parent:this,popup:_11,around:_10.domNode,orient:this._orient||["after","before"],onCancel:function(){
_12.focusChild(_10);
_12._cleanUp();
_10._setSelected(true);
_12.focusedChild=_10;
},onExecute:_1.hitch(this,"_cleanUp")});
this.currentPopup=_11;
_11.connect(_11.domNode,"onmouseenter",_1.hitch(_12,"_onPopupHover"));
if(_11.focus){
_11._focus_timer=setTimeout(_1.hitch(_11,function(){
this._focus_timer=null;
this.focus();
}),0);
}
},_markActive:function(){
this.isActive=true;
_1.replaceClass(this.domNode,"dijitMenuActive","dijitMenuPassive");
},onOpen:function(e){
this.isShowingNow=true;
this._markActive();
},_markInactive:function(){
this.isActive=false;
_1.replaceClass(this.domNode,"dijitMenuPassive","dijitMenuActive");
},onClose:function(){
this._stopFocusTimer();
this._markInactive();
this.isShowingNow=false;
this.parentMenu=null;
},_closeChild:function(){
this._stopPopupTimer();
var _13=this.focusedChild&&this.focusedChild.from_item;
if(this.currentPopup){
if(_1.indexOf(this._focusManager.activeStack,this.id)>=0){
_1.attr(this.focusedChild.focusNode,"tabIndex",this.tabIndex);
this.focusedChild.focusNode.focus();
}
pm.close(this.currentPopup);
this.currentPopup=null;
}
if(this.focusedChild){
this.focusedChild._setSelected(false);
this.focusedChild._onUnhover();
this.focusedChild=null;
}
},_onItemFocus:function(_14){
if(this._hoveredChild&&this._hoveredChild!=_14){
this._hoveredChild._onUnhover();
}
},_onBlur:function(){
this._cleanUp();
this.inherited(arguments);
},_cleanUp:function(){
this._closeChild();
if(typeof this.isShowingNow=="undefined"){
this._markInactive();
}
}});
return _2._MenuBase;
});
