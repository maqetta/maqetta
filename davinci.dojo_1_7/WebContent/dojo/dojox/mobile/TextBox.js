/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/TextBox",["dijit/_WidgetBase","dijit/form/_FormValueMixin","dijit/form/_TextBoxMixin"],function(_1,_2,_3){
return dojo.declare("dojox.mobile.TextBox",[dijit._WidgetBase,dijit.form._FormValueMixin,dijit.form._TextBoxMixin],{baseClass:"mblTextBox",_setPlaceHolderAttr:"textbox",buildRendering:function(){
if(!this.srcNodeRef){
this.srcNodeRef=dojo.create("input",{});
}
this.inherited(arguments);
this.textbox=this.focusNode=this.domNode;
},postCreate:function(){
this.inherited(arguments);
this.connect(this.textbox,"onfocus","_onFocus");
this.connect(this.textbox,"onblur","_onBlur");
}});
});
