/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ComboBoxMenu",["dojo/_base/kernel","..","./_ComboBoxMenuMixin","../_WidgetBase","../_TemplatedMixin","./_ListMouseMixin","dojo/_base/connect","dojo/_base/declare","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form._ComboBoxMenu",[_2._WidgetBase,_2._TemplatedMixin,_2.form._ListMouseMixin,_2.form._ComboBoxMenuMixin],{templateString:"<div class='dijitReset dijitMenu' dojoAttachPoint='containerNode' style='overflow: auto; overflow-x: hidden;'>"+"<div class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' role='option'></div>"+"<div class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' role='option'></div>"+"</div>",baseClass:"dijitComboBoxMenu",_createMenuItem:function(){
return _1.create("div",{"class":"dijitReset dijitMenuItem"+(this.isLeftToRight()?"":" dijitMenuItemRtl"),role:"option"});
},onHover:function(_3){
_1.addClass(_3,"dijitMenuItemHover");
},onUnhover:function(_4){
_1.removeClass(_4,"dijitMenuItemHover");
},onSelect:function(_5){
_1.addClass(_5,"dijitMenuItemSelected");
},onDeselect:function(_6){
_1.removeClass(_6,"dijitMenuItemSelected");
},_page:function(up){
var _7=0;
var _8=this.domNode.scrollTop;
var _9=_1.style(this.domNode,"height");
if(!this.getHighlightedOption()){
this.selectNextNode();
}
while(_7<_9){
if(up){
if(!this.getHighlightedOption().previousSibling||this._highlighted_option.previousSibling.style.display=="none"){
break;
}
this.selectPreviousNode();
}else{
if(!this.getHighlightedOption().nextSibling||this._highlighted_option.nextSibling.style.display=="none"){
break;
}
this.selectNextNode();
}
var _a=this.domNode.scrollTop;
_7+=(_a-_8)*(up?-1:1);
_8=_a;
}
},handleKey:function(_b){
switch(_b.charOrCode){
case _1.keys.DOWN_ARROW:
this.selectNextNode();
return false;
case _1.keys.PAGE_DOWN:
this._page(false);
return false;
case _1.keys.UP_ARROW:
this.selectPreviousNode();
return false;
case _1.keys.PAGE_UP:
this._page(true);
return false;
default:
return true;
}
}});
return _2.form._ComboBoxMenu;
});
