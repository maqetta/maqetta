/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/NumberTextBox",["dojo/_base/kernel","..","./RangeBoundTextBox","dojo/number","dojo/_base/declare","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit.form.NumberTextBoxMixin",null,{regExpGen:_1.number.regexp,value:NaN,editOptions:{pattern:"#.######"},_formatter:_1.number.format,postMixInProperties:function(){
this.inherited(arguments);
this._set("type","text");
},_setConstraintsAttr:function(_3){
var _4=typeof _3.places=="number"?_3.places:0;
if(_4){
_4++;
}
if(typeof _3.max!="number"){
_3.max=9*Math.pow(10,15-_4);
}
if(typeof _3.min!="number"){
_3.min=-9*Math.pow(10,15-_4);
}
this.inherited(arguments,[_3]);
if(this.focusNode&&this.focusNode.value&&!isNaN(this.value)){
this.set("value",this.value);
}
},_onFocus:function(){
if(this.disabled){
return;
}
var _5=this.get("value");
if(typeof _5=="number"&&!isNaN(_5)){
var _6=this.format(_5,this.constraints);
if(_6!==undefined){
this.textbox.value=_6;
}
}
this.inherited(arguments);
},format:function(_7,_8){
var _9=String(_7);
if(typeof _7!="number"){
return _9;
}
if(isNaN(_7)){
return "";
}
if(!("rangeCheck" in this&&this.rangeCheck(_7,_8))&&_8.exponent!==false&&/\de[-+]?\d/i.test(_9)){
return _9;
}
if(this.editOptions&&this.focused){
_8=_1.mixin({},_8,this.editOptions);
}
return this._formatter(_7,_8);
},_parser:_1.number.parse,parse:function(_a,_b){
var v=this._parser(_a,_1.mixin({},_b,(this.editOptions&&this.focused)?this.editOptions:{}));
if(this.editOptions&&this.focused&&isNaN(v)){
v=this._parser(_a,_b);
}
return v;
},_getDisplayedValueAttr:function(){
var v=this.inherited(arguments);
return isNaN(v)?this.textbox.value:v;
},filter:function(_c){
return (_c===null||_c===""||_c===undefined)?NaN:this.inherited(arguments);
},serialize:function(_d,_e){
return (typeof _d!="number"||isNaN(_d))?"":this.inherited(arguments);
},_setBlurValue:function(){
var _f=_1.hitch(_1.mixin({},this,{focused:true}),"get")("value");
this._setValueAttr(_f,true);
},_setValueAttr:function(_10,_11,_12){
if(_10!==undefined&&_12===undefined){
_12=String(_10);
if(typeof _10=="number"){
if(isNaN(_10)){
_12="";
}else{
if(("rangeCheck" in this&&this.rangeCheck(_10,this.constraints))||this.constraints.exponent===false||!/\de[-+]?\d/i.test(_12)){
_12=undefined;
}
}
}else{
if(!_10){
_12="";
_10=NaN;
}else{
_10=undefined;
}
}
}
this.inherited(arguments,[_10,_11,_12]);
},_getValueAttr:function(){
var v=this.inherited(arguments);
if(isNaN(v)&&this.textbox.value!==""){
if(this.constraints.exponent!==false&&/\de[-+]?\d/i.test(this.textbox.value)&&(new RegExp("^"+_1.number._realNumberRegexp(_1.mixin({},this.constraints))+"$").test(this.textbox.value))){
var n=Number(this.textbox.value);
return isNaN(n)?undefined:n;
}else{
return undefined;
}
}else{
return v;
}
},isValid:function(_13){
if(!this.focused||this._isEmpty(this.textbox.value)){
return this.inherited(arguments);
}else{
var v=this.get("value");
if(!isNaN(v)&&this.rangeCheck(v,this.constraints)){
if(this.constraints.exponent!==false&&/\de[-+]?\d/i.test(this.textbox.value)){
return true;
}else{
return this.inherited(arguments);
}
}else{
return false;
}
}
}});
_1.declare("dijit.form.NumberTextBox",[_2.form.RangeBoundTextBox,_2.form.NumberTextBoxMixin],{baseClass:"dijitTextBox dijitNumberTextBox"});
return _2.form.NumberTextBox;
});
