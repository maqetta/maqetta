/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dojox/form/resources/TriStateCheckBox.html"]="<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><div class=\"dojoxTriStateCheckBoxInner\" dojoAttachPoint=\"stateLabelNode\"></div\n\t><input ${!nameAttrSetting} type=\"${type}\" dojoAttachPoint=\"focusNode\"\n\tclass=\"dijitReset dojoxTriStateCheckBoxInput\" dojoAttachEvent=\"onclick:_onClick\"\n/></div>";
define(["dojo","dijit","dijit/form/ToggleButton","dojo/text!./resources/TriStateCheckBox.html"],function(_1,_2){
_1.declare("dojox.form.TriStateCheckBox",_2.form.ToggleButton,{templateString:_1.cache("dojox.form","resources/TriStateCheckBox.html"),baseClass:"dojoxTriStateCheckBox",type:"checkbox",_currentState:0,_stateType:"False",readOnly:false,constructor:function(){
this.states=[false,true,"mixed"];
this._stateLabels={"False":"&#63219","True":"&#8730;","Mixed":"&#8801"};
this.stateValues={"False":"off","True":"on","Mixed":"mixed"};
},_setCheckedAttr:function(_3,_4){
this._set("checked",_3);
this._currentState=_1.indexOf(this.states,_3);
this._stateType=this._getStateType(_3);
_1.attr(this.focusNode||this.domNode,"checked",_3);
_1.attr(this.focusNode,"value",this.stateValues[this._stateType]);
(this.focusNode||this.domNode).setAttribute("aria-checked",_3);
this._handleOnChange(_3,_4);
},setChecked:function(_5){
_1.deprecated("setChecked("+_5+") is deprecated. Use set('checked',"+_5+") instead.","","2.0");
this.set("checked",_5);
},_setReadOnlyAttr:function(_6){
this._set("readOnly",_6);
_1.attr(this.focusNode,"readOnly",_6);
this.focusNode.setAttribute("aria-readonly",_6);
},_setValueAttr:function(_7,_8){
if(typeof _7=="string"&&(_1.indexOf(this.states,_7)<0)){
if(_7==""){
_7="on";
}
this.stateValues["True"]=_7;
_7=true;
}
if(this._created){
this._currentState=_1.indexOf(this.states,_7);
this.set("checked",_7,_8);
_1.attr(this.focusNode,"value",this.stateValues[this._stateType]);
}
},_setValuesAttr:function(_9){
this.stateValues["True"]=_9[0]?_9[0]:this.stateValues["True"];
this.stateValues["Mixed"]=_9[1]?_9[1]:this.stateValues["False"];
},_getValueAttr:function(){
return this.stateValues[this._stateType];
},startup:function(){
this.set("checked",this.params.checked||this.states[this._currentState]);
_1.attr(this.stateLabelNode,"innerHTML",this._stateLabels[this._stateType]);
this.inherited(arguments);
},_fillContent:function(_a){
},reset:function(){
this._hasBeenBlurred=false;
this.stateValues={"False":"off","True":"on","Mixed":"mixed"};
this.set("checked",this.params.checked||this.states[0]);
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
},_onClick:function(e){
if(this.readOnly||this.disabled){
_1.stopEvent(e);
return false;
}
if(this._currentState>=this.states.length-1){
this._currentState=0;
}else{
this._currentState++;
}
this.set("checked",this.states[this._currentState]);
_1.attr(this.stateLabelNode,"innerHTML",this._stateLabels[this._stateType]);
return this.onClick(e);
},_getStateType:function(_b){
return _b?(_b=="mixed"?"Mixed":"True"):"False";
}});
return dojox.form.TriStateCheckBox;
});
