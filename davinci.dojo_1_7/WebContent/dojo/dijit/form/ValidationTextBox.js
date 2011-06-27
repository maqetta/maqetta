/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/ValidationTextBox.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\" role=\"presentation\"\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n";
define("dijit/form/ValidationTextBox",["dojo/_base/kernel","..","dojo/text!./templates/ValidationTextBox.html","dojo/i18n","./TextBox","../Tooltip","dojo/i18n!./nls/validate","dojo/_base/declare"],function(_1,_2,_3){
_1.declare("dijit.form.ValidationTextBox",_2.form.TextBox,{templateString:_3,baseClass:"dijitTextBox dijitValidationTextBox",required:false,promptMessage:"",invalidMessage:"$_unset_$",missingMessage:"$_unset_$",message:"",constraints:{},regExp:".*",regExpGen:function(_4){
return this.regExp;
},state:"",tooltipPosition:[],_setValueAttr:function(){
this.inherited(arguments);
this.validate(this.focused);
},validator:function(_5,_6){
return (new RegExp("^(?:"+this.regExpGen(_6)+")"+(this.required?"":"?")+"$")).test(_5)&&(!this.required||!this._isEmpty(_5))&&(this._isEmpty(_5)||this.parse(_5,_6)!==undefined);
},_isValidSubset:function(){
return this.textbox.value.search(this._partialre)==0;
},isValid:function(_7){
return this.validator(this.textbox.value,this.constraints);
},_isEmpty:function(_8){
return (this.trim?/^\s*$/:/^$/).test(_8);
},getErrorMessage:function(_9){
return (this.required&&this._isEmpty(this.textbox.value))?this.missingMessage:this.invalidMessage;
},getPromptMessage:function(_a){
return this.promptMessage;
},_maskValidSubsetError:true,validate:function(_b){
var _c="";
var _d=this.disabled||this.isValid(_b);
if(_d){
this._maskValidSubsetError=true;
}
var _e=this._isEmpty(this.textbox.value);
var _f=!_d&&_b&&this._isValidSubset();
this._set("state",_d?"":(((((!this._hasBeenBlurred||_b)&&_e)||_f)&&this._maskValidSubsetError)?"Incomplete":"Error"));
this.focusNode.setAttribute("aria-invalid",_d?"false":"true");
if(this.state=="Error"){
this._maskValidSubsetError=_b&&_f;
_c=this.getErrorMessage(_b);
}else{
if(this.state=="Incomplete"){
_c=this.getPromptMessage(_b);
this._maskValidSubsetError=!this._hasBeenBlurred||_b;
}else{
if(_e){
_c=this.getPromptMessage(_b);
}
}
}
this.set("message",_c);
return _d;
},displayMessage:function(_10){
if(_10&&this.focused){
_2.showTooltip(_10,this.domNode,this.tooltipPosition,!this.isLeftToRight());
}else{
_2.hideTooltip(this.domNode);
}
},_refreshState:function(){
this.validate(this.focused);
this.inherited(arguments);
},constructor:function(){
this.constraints={};
},_setConstraintsAttr:function(_11){
if(!_11.locale&&this.lang){
_11.locale=this.lang;
}
this._set("constraints",_11);
this._computePartialRE();
},_computePartialRE:function(){
var p=this.regExpGen(this.constraints);
this.regExp=p;
var _12="";
if(p!=".*"){
this.regExp.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g,function(re){
switch(re.charAt(0)){
case "{":
case "+":
case "?":
case "*":
case "^":
case "$":
case "|":
case "(":
_12+=re;
break;
case ")":
_12+="|$)";
break;
default:
_12+="(?:"+re+"|$)";
break;
}
});
}
try{
"".search(_12);
}
catch(e){
_12=this.regExp;
console.warn("RegExp error in "+this.declaredClass+": "+this.regExp);
}
this._partialre="^(?:"+_12+")$";
},postMixInProperties:function(){
this.inherited(arguments);
this.messages=_1.i18n.getLocalization("dijit.form","validate",this.lang);
if(this.invalidMessage=="$_unset_$"){
this.invalidMessage=this.messages.invalidMessage;
}
if(!this.invalidMessage){
this.invalidMessage=this.promptMessage;
}
if(this.missingMessage=="$_unset_$"){
this.missingMessage=this.messages.missingMessage;
}
if(!this.missingMessage){
this.missingMessage=this.invalidMessage;
}
this._setConstraintsAttr(this.constraints);
},_setDisabledAttr:function(_13){
this.inherited(arguments);
this._refreshState();
},_setRequiredAttr:function(_14){
this._set("required",_14);
this.focusNode.setAttribute("aria-required",_14);
this._refreshState();
},_setMessageAttr:function(_15){
this._set("message",_15);
this.displayMessage(_15);
},reset:function(){
this._maskValidSubsetError=true;
this.inherited(arguments);
},_onBlur:function(){
this.displayMessage("");
this.inherited(arguments);
}});
return _2.form.ValidationTextBox;
});
