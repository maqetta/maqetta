/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/CheckBox.html"]="<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><input\n\t \t${!nameAttrSetting} type=\"${type}\" ${checkedAttrSetting}\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\n\t\tdojoAttachPoint=\"focusNode\"\n\t \tdojoAttachEvent=\"onclick:_onClick\"\n/></div>\n";
define("dijit/form/CheckBox",["dojo/_base/kernel","..","dojo/text!./templates/CheckBox.html","require","./ToggleButton","./_CheckBoxMixin","dojo/_base/NodeList","dojo/_base/declare","dojo/_base/html","dojo/query"],function(_1,_2,_3,_4){
_1.declare("dijit.form.CheckBox",[_2.form.ToggleButton,_2.form._CheckBoxMixin],{templateString:_3,baseClass:"dijitCheckBox",_setValueAttr:function(_5,_6){
if(typeof _5=="string"){
this._set("value",_5);
_1.attr(this.focusNode,"value",_5);
_5=true;
}
if(this._created){
this.set("checked",_5,_6);
}
},_getValueAttr:function(){
return (this.checked?this.value:false);
},_setIconClassAttr:null,postMixInProperties:function(){
this.inherited(arguments);
this.checkedAttrSetting=this.checked?"checked":"";
},_fillContent:function(_7){
},_onFocus:function(){
if(this.id){
_1.query("label[for='"+this.id+"']").addClass("dijitFocusedLabel");
}
this.inherited(arguments);
},_onBlur:function(){
if(this.id){
_1.query("label[for='"+this.id+"']").removeClass("dijitFocusedLabel");
}
this.inherited(arguments);
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _8=["dijit/form/RadioButton"];
_4(_8);
});
}
return _2.form.CheckBox;
});
