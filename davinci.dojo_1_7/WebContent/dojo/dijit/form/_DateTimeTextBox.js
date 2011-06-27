/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/form/templates/DropDownBox.html"]="<div class=\"dijit dijitReset dijitInline dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\"\n\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton dijitArrowButtonContainer'\n\t\tdojoAttachPoint=\"_buttonNode, _popupStateNode\" role=\"presentation\"\n\t\t><input class=\"dijitReset dijitInputField dijitArrowButtonInner\" value=\"&#9660; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t\t\t${_buttonInputDisabled}\n\t/></div\n\t><div class='dijitReset dijitValidationContainer'\n\t\t><input class=\"dijitReset dijitInputField dijitValidationIcon dijitValidationInner\" value=\"&#935; \" type=\"text\" tabIndex=\"-1\" readonly=\"readonly\" role=\"presentation\"\n\t/></div\n\t><div class=\"dijitReset dijitInputField dijitInputContainer\"\n\t\t><input class='dijitReset dijitInputInner' ${!nameAttrSetting} type=\"text\" autocomplete=\"off\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" role=\"textbox\" aria-haspopup=\"true\"\n\t/></div\n></div>\n";
define("dijit/form/_DateTimeTextBox",["dojo/_base/kernel","..","dojo/text!./templates/DropDownBox.html","dojo/date","dojo/date/locale","dojo/date/stamp","./RangeBoundTextBox","../_HasDropDown","dojo/_base/declare"],function(_1,_2,_3){
new Date("X");
_1.declare("dijit.form._DateTimeTextBox",[_2.form.RangeBoundTextBox,_2._HasDropDown],{templateString:_3,hasDownArrow:true,openOnClick:true,regExpGen:_1.date.locale.regexp,datePackage:"dojo.date",postMixInProperties:function(){
this.inherited(arguments);
this._set("type","text");
},compare:function(_4,_5){
var _6=this._isInvalidDate(_4);
var _7=this._isInvalidDate(_5);
return _6?(_7?0:-1):(_7?1:_1.date.compare(_4,_5,this._selector));
},forceWidth:true,format:function(_8,_9){
if(!_8){
return "";
}
return this.dateLocaleModule.format(_8,_9);
},"parse":function(_a,_b){
return this.dateLocaleModule.parse(_a,_b)||(this._isEmpty(_a)?null:undefined);
},serialize:function(_c,_d){
if(_c.toGregorian){
_c=_c.toGregorian();
}
return _1.date.stamp.toISOString(_c,_d);
},dropDownDefaultValue:new Date(),value:new Date(""),_blankValue:null,popupClass:"",_selector:"",constructor:function(_e){
var _f=_e.datePackage?_e.datePackage+".Date":"Date";
this.dateClassObj=_1.getObject(_f,false);
this.value=new this.dateClassObj("");
this.datePackage=_e.datePackage||this.datePackage;
this.dateLocaleModule=_1.getObject(this.datePackage+".locale",false);
this.regExpGen=this.dateLocaleModule.regexp;
this._invalidDate=_2.form._DateTimeTextBox.prototype.value.toString();
},buildRendering:function(){
this.inherited(arguments);
if(!this.hasDownArrow){
this._buttonNode.style.display="none";
}
if(this.openOnClick||!this.hasDownArrow){
this._buttonNode=this.domNode;
this.baseClass+=" dijitComboBoxOpenOnClick";
}
},_setConstraintsAttr:function(_10){
_10.selector=this._selector;
_10.fullYear=true;
var _11=_1.date.stamp.fromISOString;
if(typeof _10.min=="string"){
_10.min=_11(_10.min);
}
if(typeof _10.max=="string"){
_10.max=_11(_10.max);
}
this.inherited(arguments);
},_isInvalidDate:function(_12){
return !_12||isNaN(_12)||typeof _12!="object"||_12.toString()==this._invalidDate;
},_setValueAttr:function(_13,_14,_15){
if(_13!==undefined){
if(typeof _13=="string"){
_13=_1.date.stamp.fromISOString(_13);
}
if(this._isInvalidDate(_13)){
_13=null;
}
if(_13 instanceof Date&&!(this.dateClassObj instanceof Date)){
_13=new this.dateClassObj(_13);
}
}
this.inherited(arguments);
if(this.dropDown){
this.dropDown.set("value",_13,false);
}
},_set:function(_16,_17){
if(_16=="value"&&this.value instanceof Date&&this.compare(_17,this.value)==0){
return;
}
this.inherited(arguments);
},_setDropDownDefaultValueAttr:function(val){
if(this._isInvalidDate(val)){
val=new this.dateClassObj();
}
this.dropDownDefaultValue=val;
},openDropDown:function(_18){
if(this.dropDown){
this.dropDown.destroy();
}
var _19=_1.getObject(this.popupClass,false),_1a=this,_1b=this.get("value");
this.dropDown=new _19({onChange:function(_1c){
_2.form._DateTimeTextBox.superclass._setValueAttr.call(_1a,_1c,true);
},id:this.id+"_popup",dir:_1a.dir,lang:_1a.lang,value:_1b,currentFocus:!this._isInvalidDate(_1b)?_1b:this.dropDownDefaultValue,constraints:_1a.constraints,filterString:_1a.filterString,datePackage:_1a.datePackage,isDisabledDate:function(_1d){
return !_1a.rangeCheck(_1d,_1a.constraints);
}});
this.inherited(arguments);
},_getDisplayedValueAttr:function(){
return this.textbox.value;
},_setDisplayedValueAttr:function(_1e,_1f){
this._setValueAttr(this.parse(_1e,this.constraints),_1f,_1e);
}});
return _2.form._DateTimeTextBox;
});
