/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/_ComboBoxMenu",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dijit/form/_ComboBoxMenuMixin","dijit/_WidgetBase","dojox/mobile/_ListTouchMixin","./scrollable"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile._ComboBoxMenu",[dijit._WidgetBase,dojox.mobile._ListTouchMixin,dijit.form._ComboBoxMenuMixin],{baseClass:"mblComboBoxMenu",bgIframe:true,buildRendering:function(){
this.domNode=this.focusNode=_1.create("div",{"class":"mblReset"});
this.containerNode=_1.create("div",{style:{position:"absolute",top:0,left:0}},this.domNode);
this.previousButton=_1.create("div",{"class":"mblReset mblComboBoxMenuItem mblComboBoxMenuPreviousButton",role:"option"},this.containerNode);
this.nextButton=_1.create("div",{"class":"mblReset mblComboBoxMenuItem mblComboBoxMenuNextButton",role:"option"},this.containerNode);
this.inherited(arguments);
},_createMenuItem:function(){
return _1.create("div",{"class":"mblReset mblComboBoxMenuItem"+(this.isLeftToRight()?"":" mblComboBoxMenuItemRtl"),role:"option"});
},onSelect:function(_8){
_1.addClass(_8,"mblComboBoxMenuItemSelected");
},onDeselect:function(_9){
_1.removeClass(_9,"mblComboBoxMenuItemSelected");
},onOpen:function(){
this.scrollable.init({domNode:this.domNode,containerNode:this.containerNode});
this.scrollable.scrollTo({x:0,y:0});
},onClose:function(){
this.scrollable.cleanup();
},destroyRendering:function(){
this.bgIframe=false;
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.scrollable=new dojox.mobile.scrollable(_1,dojox);
this.scrollable.resize=function(){
};
}});
});
