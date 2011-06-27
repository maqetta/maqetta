/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/RangeBoundTextBox",["dojo/_base/kernel","..","./MappedTextBox","dojo/_base/declare","dojo/i18n"],function(_1,_2){
_1.declare("dijit.form.RangeBoundTextBox",_2.form.MappedTextBox,{rangeMessage:"",rangeCheck:function(_3,_4){
return ("min" in _4?(this.compare(_3,_4.min)>=0):true)&&("max" in _4?(this.compare(_3,_4.max)<=0):true);
},isInRange:function(_5){
return this.rangeCheck(this.get("value"),this.constraints);
},_isDefinitelyOutOfRange:function(){
var _6=this.get("value");
var _7=false;
var _8=false;
if("min" in this.constraints){
var _9=this.constraints.min;
_9=this.compare(_6,((typeof _9=="number")&&_9>=0&&_6!=0)?0:_9);
_7=(typeof _9=="number")&&_9<0;
}
if("max" in this.constraints){
var _a=this.constraints.max;
_a=this.compare(_6,((typeof _a!="number")||_a>0)?_a:0);
_8=(typeof _a=="number")&&_a>0;
}
return _7||_8;
},_isValidSubset:function(){
return this.inherited(arguments)&&!this._isDefinitelyOutOfRange();
},isValid:function(_b){
return this.inherited(arguments)&&((this._isEmpty(this.textbox.value)&&!this.required)||this.isInRange(_b));
},getErrorMessage:function(_c){
var v=this.get("value");
if(v!==null&&v!==""&&v!==undefined&&(typeof v!="number"||!isNaN(v))&&!this.isInRange(_c)){
return this.rangeMessage;
}
return this.inherited(arguments);
},postMixInProperties:function(){
this.inherited(arguments);
if(!this.rangeMessage){
this.messages=_1.i18n.getLocalization("dijit.form","validate",this.lang);
this.rangeMessage=this.messages.rangeMessage;
}
},_setConstraintsAttr:function(_d){
this.inherited(arguments);
if(this.focusNode){
if(this.constraints.min!==undefined){
this.focusNode.setAttribute("aria-valuemin",this.constraints.min);
}else{
this.focusNode.removeAttribute("aria-valuemin");
}
if(this.constraints.max!==undefined){
this.focusNode.setAttribute("aria-valuemax",this.constraints.max);
}else{
this.focusNode.removeAttribute("aria-valuemax");
}
}
},_setValueAttr:function(_e,_f){
this.focusNode.setAttribute("aria-valuenow",_e);
this.inherited(arguments);
},applyTextDir:function(_10,_11){
}});
return _2.form.RangeBoundTextBox;
});
