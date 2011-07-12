/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/MenuItem.html"]="<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\"/>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\"/>\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\n\t\t</div>\n\t</td>\n</tr>\n";
define("dijit/MenuItem",["dojo/_base/kernel",".","dojo/text!./templates/MenuItem.html","./_Widget","./_TemplatedMixin","./_Contained","./_CssStateMixin","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/sniff"],function(_1,_2,_3){
_1.declare("dijit.MenuItem",[_2._Widget,_2._TemplatedMixin,_2._Contained,_2._CssStateMixin],{templateString:_3,baseClass:"dijitMenuItem",label:"",_setLabelAttr:{node:"containerNode",type:"innerHTML"},iconClass:"dijitNoIcon",_setIconClassAttr:{node:"iconNode",type:"class"},accelKey:"",disabled:false,_fillContent:function(_4){
if(_4&&!("label" in this.params)){
this.set("label",_4.innerHTML);
}
},buildRendering:function(){
this.inherited(arguments);
var _5=this.id+"_text";
_1.attr(this.containerNode,"id",_5);
if(this.accelKeyNode){
_1.attr(this.accelKeyNode,"id",this.id+"_accel");
_5+=" "+this.id+"_accel";
}
this.domNode.setAttribute("aria-labelledby",_5);
_1.setSelectable(this.domNode,false);
},_onHover:function(){
this.getParent().onItemHover(this);
},_onUnhover:function(){
this.getParent().onItemUnhover(this);
this._set("hovering",false);
},_onClick:function(_6){
this.getParent().onItemClick(this,_6);
_1.stopEvent(_6);
},onClick:function(_7){
},focus:function(){
try{
if(_1.isIE==8){
this.containerNode.focus();
}
this.focusNode.focus();
}
catch(e){
}
},_onFocus:function(){
this._setSelected(true);
this.getParent()._onItemFocus(this);
this.inherited(arguments);
},_setSelected:function(_8){
_1.toggleClass(this.domNode,"dijitMenuItemSelected",_8);
},setLabel:function(_9){
_1.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.","","2.0");
this.set("label",_9);
},setDisabled:function(_a){
_1.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.","","2.0");
this.set("disabled",_a);
},_setDisabledAttr:function(_b){
this.focusNode.setAttribute("aria-disabled",_b?"true":"false");
this._set("disabled",_b);
},_setAccelKeyAttr:function(_c){
this.accelKeyNode.style.display=_c?"":"none";
this.accelKeyNode.innerHTML=_c;
_1.attr(this.containerNode,"colSpan",_c?"1":"2");
this._set("accelKey",_c);
}});
return _2.MenuItem;
});
