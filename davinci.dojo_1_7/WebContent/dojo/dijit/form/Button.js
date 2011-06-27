/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/Button.html"]="<span class=\"dijit dijitReset dijitInline\"\n\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\tdojoAttachEvent=\"ondijitclick:_onClick\"\n\t\t><span class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\n\t\t\trole=\"button\" aria-labelledby=\"${id}_label\"\n\t\t\t><span class=\"dijitReset dijitInline dijitIcon\" dojoAttachPoint=\"iconNode\"></span\n\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#x25CF;</span\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\tid=\"${id}_label\"\n\t\t\t\tdojoAttachPoint=\"containerNode\"\n\t\t\t></span\n\t\t></span\n\t></span\n\t><input ${!nameAttrSetting} type=\"${type}\" value=\"${value}\" class=\"dijitOffScreen\" tabIndex=\"-1\"\n\t\tdojoAttachPoint=\"valueNode\"\n/></span>";
define("dijit/form/Button",["dojo/_base/kernel","..","dojo/text!./templates/Button.html","require","./_FormWidget","./_ButtonMixin","../_Container","../_HasDropDown","dojo/_base/html","dojo/_base/lang"],function(_1,_2,_3,_4){
_1.declare("dijit.form.Button",[_2.form._FormWidget,_2.form._ButtonMixin],{showLabel:true,iconClass:"dijitNoIcon",_setIconClassAttr:{node:"iconNode",type:"class"},baseClass:"dijitButton",templateString:_3,_setValueAttr:"valueNode",_onClick:function(e){
var ok=this.inherited(arguments);
if(ok){
if(this.valueNode){
this.valueNode.click();
e.preventDefault();
}
}
return ok;
},_fillContent:function(_5){
if(_5&&(!this.params||!("label" in this.params))){
var _6=_1.trim(_5.innerHTML);
if(_6){
this.label=_6;
}
}
},_setShowLabelAttr:function(_7){
if(this.containerNode){
_1.toggleClass(this.containerNode,"dijitDisplayNone",!_7);
}
this._set("showLabel",_7);
},setLabel:function(_8){
_1.deprecated("dijit.form.Button.setLabel() is deprecated.  Use set('label', ...) instead.","","2.0");
this.set("label",_8);
},_setLabelAttr:function(_9){
this.inherited(arguments);
if(!this.showLabel&&!("title" in this.params)){
this.titleNode.title=_1.trim(this.containerNode.innerText||this.containerNode.textContent||"");
}
}});
if(!_1.isAsync){
_1.ready(0,function(){
var _a=["dijit/form/DropDownButton","dijit/form/ComboButton","dijit/form/ToggleButton"];
_4(_a);
});
}
return _2.form.Button;
});
