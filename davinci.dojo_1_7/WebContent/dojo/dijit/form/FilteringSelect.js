/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/FilteringSelect",["dojo/_base/kernel","..","./MappedTextBox","./ComboBoxMixin","dojo/_base/Deferred","dojo/_base/declare","dojo/_base/lang","dojo/data/util/filter"],function(_1,_2){
_1.declare("dijit.form.FilteringSelect",[_2.form.MappedTextBox,_2.form.ComboBoxMixin],{required:true,_lastDisplayedValue:"",_isValidSubset:function(){
return this._opened;
},isValid:function(){
return this.item||(!this.required&&this.get("displayedValue")=="");
},_refreshState:function(){
if(!this.searchTimer){
this.inherited(arguments);
}
},_callbackSetLabel:function(_3,_4,_5,_6){
if((_4&&_4[this.searchAttr]!==this._lastQuery)||(!_4&&_3.length&&this.store.getIdentity(_3[0])!=this._lastQuery)){
return;
}
if(!_3.length){
this.set("value","",_6||(_6===undefined&&!this.focused),this.textbox.value,null);
}else{
this.set("item",_3[0],_6);
}
},_openResultList:function(_7,_8,_9){
if(_8[this.searchAttr]!==this._lastQuery){
return;
}
this.inherited(arguments);
if(this.item===undefined){
this.validate(true);
}
},_getValueAttr:function(){
return this.valueNode.value;
},_getValueField:function(){
return "value";
},_setValueAttr:function(_a,_b,_c,_d){
if(!this._onChangeActive){
_b=null;
}
if(_d===undefined){
if(_a===null||_a===""){
_a="";
if(!_1.isString(_c)){
this._setDisplayedValueAttr(_c||"",_b);
return;
}
}
var _e=this;
this._lastQuery=_a;
_1.when(this.store.get(_a),function(_f){
_e._callbackSetLabel(_f?[_f]:[],undefined,undefined,_b);
});
}else{
this.valueNode.value=_a;
this.inherited(arguments);
}
},_setItemAttr:function(_10,_11,_12){
this.inherited(arguments);
this._lastDisplayedValue=this.textbox.value;
},_getDisplayQueryString:function(_13){
return _13.replace(/([\\\*\?])/g,"\\$1");
},_setDisplayedValueAttr:function(_14,_15){
if(_14==null){
_14="";
}
if(!this._created){
if(!("displayedValue" in this.params)){
return;
}
_15=false;
}
if(this.store){
this.closeDropDown();
var _16=_1.clone(this.query);
var qs=this._getDisplayQueryString(_14),q=_1.data.util.filter.patternToRegExp(qs,this.ignoreCase);
q.toString=function(){
return qs;
};
this._lastQuery=_16[this.searchAttr]=q;
this.textbox.value=_14;
this._lastDisplayedValue=_14;
this._set("displayedValue",_14);
var _17=this;
var _18={ignoreCase:this.ignoreCase,deep:true};
_1.mixin(_18,this.fetchProperties);
this._fetchHandle=this.store.query(_16,_18);
_1.when(this._fetchHandle,function(_19){
_17._fetchHandle=null;
_17._callbackSetLabel(_19||[],_16,_18,_15);
},function(err){
_17._fetchHandle=null;
if(!_17._cancelingQuery){
console.error("dijit.form.FilteringSelect: "+err.toString());
}
});
}
},undo:function(){
this.set("displayedValue",this._lastDisplayedValue);
}});
return _2.form.FilteringSelect;
});
