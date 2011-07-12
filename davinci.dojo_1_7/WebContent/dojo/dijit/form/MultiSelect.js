/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/MultiSelect",["dojo/_base/kernel","..","./_FormWidget","dojo/_base/NodeList","dojo/_base/array","dojo/_base/html","dojo/query"],function(_1,_2){
_1.declare("dijit.form.MultiSelect",_2.form._FormValueWidget,{size:7,templateString:"<select multiple='true' ${!nameAttrSetting} dojoAttachPoint='containerNode,focusNode' dojoAttachEvent='onchange: _onChange'></select>",addSelected:function(_3){
_3.getSelected().forEach(function(n){
this.containerNode.appendChild(n);
this.domNode.scrollTop=this.domNode.offsetHeight;
var _4=_3.domNode.scrollTop;
_3.domNode.scrollTop=0;
_3.domNode.scrollTop=_4;
},this);
this._set("value",this.get("value"));
},getSelected:function(){
return _1.query("option",this.containerNode).filter(function(n){
return n.selected;
});
},_getValueAttr:function(){
return this.getSelected().map(function(n){
return n.value;
});
},multiple:true,_setValueAttr:function(_5,_6){
_1.query("option",this.containerNode).forEach(function(n){
n.selected=(_1.indexOf(_5,n.value)!=-1);
});
this.inherited(arguments);
},invertSelection:function(_7){
var _8=[];
_1.query("option",this.containerNode).forEach(function(n){
if(!n.selected){
_8.push(n.value);
}
});
this._setValueAttr(_8,!(_7===false||_7==null));
},_onChange:function(e){
this._handleOnChange(this.get("value"),true);
},resize:function(_9){
if(_9){
_1.marginBox(this.domNode,_9);
}
},postCreate:function(){
this._set("value",this.get("value"));
this.inherited(arguments);
}});
return _2.form.MultiSelect;
});
