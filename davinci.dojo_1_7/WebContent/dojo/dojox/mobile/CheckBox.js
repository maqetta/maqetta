/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/CheckBox",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","./ToggleButton","dijit/form/_CheckBoxMixin"],function(_1,_2,_3,_4,_5){
return _1.declare("dojox.mobile.CheckBox",[dojox.mobile.ToggleButton,dijit.form._CheckBoxMixin],{baseClass:"mblCheckBox",_setTypeAttr:function(){
},buildRendering:function(){
if(!this.srcNodeRef){
this.srcNodeRef=_1.create("input",{type:this.type});
}
this.inherited(arguments);
this.focusNode=this.domNode;
}});
});
