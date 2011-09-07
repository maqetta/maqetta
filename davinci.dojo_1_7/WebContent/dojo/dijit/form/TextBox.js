/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/TextBox.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\" id=\"widget_${id}\" role=\"presentation\"\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class=\"dijitReset dijitInputInner\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${!nameAttrSetting} type='${type}'\n\t/></div\n></div>\n";
define("dijit/form/TextBox",["dojo/_base/kernel","..","dojo/text!./templates/TextBox.html","./_FormWidget","./_TextBoxMixin","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2,_3){
_1.declare("dijit.form.TextBox",[_2.form._FormValueWidget,_2.form._TextBoxMixin],{templateString:_3,_singleNodeTemplate:"<input class=\"dijit dijitReset dijitLeft dijitInputField\" dojoAttachPoint=\"textbox,focusNode\" autocomplete=\"off\" type=\"${type}\" ${!nameAttrSetting} />",_buttonInputDisabled:_1.isIE?"disabled":"",baseClass:"dijitTextBox",postMixInProperties:function(){
var _4=this.type.toLowerCase();
if(this.templateString&&this.templateString.toLowerCase()=="input"||((_4=="hidden"||_4=="file")&&this.templateString==_2.form.TextBox.prototype.templateString)){
this.templateString=this._singleNodeTemplate;
}
this.inherited(arguments);
},_onInput:function(e){
this.inherited(arguments);
if(this.intermediateChanges){
var _5=this;
setTimeout(function(){
_5._handleOnChange(_5.get("value"),false);
},0);
}
},_setPlaceHolderAttr:function(v){
this._set("placeHolder",v);
if(!this._phspan){
this._attachPoints.push("_phspan");
this._phspan=_1.create("span",{className:"dijitPlaceHolder dijitInputField"},this.textbox,"after");
}
this._phspan.innerHTML="";
this._phspan.appendChild(document.createTextNode(v));
this._updatePlaceHolder();
},_updatePlaceHolder:function(){
if(this._phspan){
this._phspan.style.display=(this.placeHolder&&!this.focused&&!this.textbox.value)?"":"none";
}
},_setValueAttr:function(_6,_7,_8){
this.inherited(arguments);
this._updatePlaceHolder();
},getDisplayedValue:function(){
_1.deprecated(this.declaredClass+"::getDisplayedValue() is deprecated. Use set('displayedValue') instead.","","2.0");
return this.get("displayedValue");
},setDisplayedValue:function(_9){
_1.deprecated(this.declaredClass+"::setDisplayedValue() is deprecated. Use set('displayedValue', ...) instead.","","2.0");
this.set("displayedValue",_9);
},_onBlur:function(e){
if(this.disabled){
return;
}
this.inherited(arguments);
this._updatePlaceHolder();
},_onFocus:function(by){
if(this.disabled||this.readOnly){
return;
}
this.inherited(arguments);
this._updatePlaceHolder();
}});
if(_1.isIE){
_2.form.TextBox=_1.declare(_2.form.TextBox,{_isTextSelected:function(){
var _a=_1.doc.selection.createRange();
var _b=_a.parentElement();
return _b==this.textbox&&_a.text.length==0;
},postCreate:function(){
this.inherited(arguments);
setTimeout(_1.hitch(this,function(){
var s=_1.getComputedStyle(this.domNode);
if(s){
var ff=s.fontFamily;
if(ff){
var _c=this.domNode.getElementsByTagName("INPUT");
if(_c){
for(var i=0;i<_c.length;i++){
_c[i].style.fontFamily=ff;
}
}
}
}
}),0);
}});
_2._setSelectionRange=function(_d,_e,_f){
if(_d.createTextRange){
var r=_d.createTextRange();
r.collapse(true);
r.moveStart("character",-99999);
r.moveStart("character",_e);
r.moveEnd("character",_f-_e);
r.select();
}
};_2.form.TextBox.prototype.declaredClass = "dijit.form.TextBox";
}
if(_1.isMoz){
_2.form.TextBox=_1.declare(_2.form.TextBox,{_onBlur:function(e){
this.inherited(arguments);
if(this.selectOnClick){
this.textbox.selectionStart=this.textbox.selectionEnd=undefined;
}
}});_2.form.TextBox.prototype.declaredClass = "dijit.form.TextBox";
}
return _2.form.TextBox;
});
