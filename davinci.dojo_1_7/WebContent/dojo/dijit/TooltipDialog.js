/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/TooltipDialog.html"]="<div role=\"presentation\" tabIndex=\"-1\">\n\t<div class=\"dijitTooltipContainer\" role=\"presentation\">\n\t\t<div class =\"dijitTooltipContents dijitTooltipFocusNode\" dojoAttachPoint=\"containerNode\" role=\"dialog\"></div>\n\t</div>\n\t<div class=\"dijitTooltipConnector\" role=\"presentation\"></div>\n</div>\n";
define("dijit/TooltipDialog",["dojo/_base/kernel",".","dojo/text!./templates/TooltipDialog.html","./layout/ContentPane","./_TemplatedMixin","./form/_FormMixin","./_DialogMixin","./focus","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang"],function(_1,_2,_3){
_1.declare("dijit.TooltipDialog",[_2.layout.ContentPane,_2._TemplatedMixin,_2.form._FormMixin,_2._DialogMixin],{title:"",doLayout:false,autofocus:true,baseClass:"dijitTooltipDialog",_firstFocusItem:null,_lastFocusItem:null,templateString:_3,_setTitleAttr:function(_4){
this.containerNode.title=_4;
this._set("title",_4);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.containerNode,"onkeypress","_onKey");
},orient:function(_5,_6,_7){
var _8="dijitTooltipAB"+(_7.charAt(1)=="L"?"Left":"Right")+" dijitTooltip"+(_7.charAt(0)=="T"?"Below":"Above");
_1.replaceClass(this.domNode,_8,this._currentOrientClass||"");
this._currentOrientClass=_8;
},focus:function(){
this._getFocusItems(this.containerNode);
_2.focus(this._firstFocusItem);
},onOpen:function(_9){
this.orient(this.domNode,_9.aroundCorner,_9.corner);
this._onShow();
},onClose:function(){
this.onHide();
},_onKey:function(_a){
var _b=_a.target;
var dk=_1.keys;
if(_a.charOrCode===dk.TAB){
this._getFocusItems(this.containerNode);
}
var _c=(this._firstFocusItem==this._lastFocusItem);
if(_a.charOrCode==dk.ESCAPE){
setTimeout(_1.hitch(this,"onCancel"),0);
_1.stopEvent(_a);
}else{
if(_b==this._firstFocusItem&&_a.shiftKey&&_a.charOrCode===dk.TAB){
if(!_c){
_2.focus(this._lastFocusItem);
}
_1.stopEvent(_a);
}else{
if(_b==this._lastFocusItem&&_a.charOrCode===dk.TAB&&!_a.shiftKey){
if(!_c){
_2.focus(this._firstFocusItem);
}
_1.stopEvent(_a);
}else{
if(_a.charOrCode===dk.TAB){
_a.stopPropagation();
}
}
}
}
}});
return _2.TooltipDialog;
});
