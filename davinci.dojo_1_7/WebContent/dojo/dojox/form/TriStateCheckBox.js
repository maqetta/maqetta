/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/form/resources/TriStateCheckBox.html"]="<div class=\"dijit dijitReset dijitInline\" role=\"presentation\"\n\t><div class=\"dojoxTriStateCheckBoxInner\" dojoAttachPoint=\"stateLabelNode\"></div\n\t><input ${!nameAttrSetting} type=\"${type}\" dojoAttachPoint=\"focusNode\"\n\tclass=\"dijitReset dojoxTriStateCheckBoxInput\" dojoAttachEvent=\"onclick:_onClick\"\n/></div>";
define("dojox/form/TriStateCheckBox",["dojo","dijit","dojo/text!./resources/TriStateCheckBox.html","dijit/form/ToggleButton"],function(_1,_2,_3){
_1.declare("dojox.form.TriStateCheckBox",_2.form.ToggleButton,{templateString:_3,baseClass:"dojoxTriStateCheckBox",type:"checkbox",_currentState:0,_stateType:"False",readOnly:false,constructor:function(){
this.states=[false,true,"mixed"];
this._stateLabels={"False":"&#63219","True":"&#8730;","Mixed":"&#8801"};
this.stateValues={"False":"off","True":"on","Mixed":"mixed"};
},_setIconClassAttr:null,_setCheckedAttr:function(_4,_5){
this._set("checked",_4);
this._currentState=_1.indexOf(this.states,_4);
this._stateType=this._getStateType(_4);
_1.attr(this.focusNode||this.domNode,"checked",_4);
_1.attr(this.focusNode,"value",this.stateValues[this._stateType]);
(this.focusNode||this.domNode).setAttribute("aria-checked",_4);
this._handleOnChange(_4,_5);
},setChecked:function(_6){
_1.deprecated("setChecked("+_6+") is deprecated. Use set('checked',"+_6+") instead.","","2.0");
this.set("checked",_6);
},_setReadOnlyAttr:function(_7){
this._set("readOnly",_7);
_1.attr(this.focusNode,"readOnly",_7);
this.focusNode.setAttribute("aria-readonly",_7);
},_setValueAttr:function(_8,_9){
if(typeof _8=="string"&&(_1.indexOf(this.states,_8)<0)){
if(_8==""){
_8="on";
}
this.stateValues["True"]=_8;
_8=true;
}
if(this._created){
this._currentState=_1.indexOf(this.states,_8);
this.set("checked",_8,_9);
_1.attr(this.focusNode,"value",this.stateValues[this._stateType]);
}
},_setValuesAttr:function(_a){
this.stateValues["True"]=_a[0]?_a[0]:this.stateValues["True"];
this.stateValues["Mixed"]=_a[1]?_a[1]:this.stateValues["False"];
},_getValueAttr:function(){
return this.stateValues[this._stateType];
},startup:function(){
this.set("checked",this.params.checked||this.states[this._currentState]);
_1.attr(this.stateLabelNode,"innerHTML",this._stateLabels[this._stateType]);
this.inherited(arguments);
},_fillContent:function(_b){
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
},_getStateType:function(_c){
return _c?(_c=="mixed"?"Mixed":"True"):"False";
}});
return dojox.form.TriStateCheckBox;
});
