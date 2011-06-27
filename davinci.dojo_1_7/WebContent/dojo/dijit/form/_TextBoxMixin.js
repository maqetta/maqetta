/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_TextBoxMixin",["dojo/_base/kernel","..","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.form._TextBoxMixin",null,{trim:false,uppercase:false,lowercase:false,propercase:false,maxLength:"",selectOnClick:false,placeHolder:"",_getValueAttr:function(){
return this.parse(this.get("displayedValue"),this.constraints);
},_setValueAttr:function(_3,_4,_5){
var _6;
if(_3!==undefined){
_6=this.filter(_3);
if(typeof _5!="string"){
if(_6!==null&&((typeof _6!="number")||!isNaN(_6))){
_5=this.filter(this.format(_6,this.constraints));
}else{
_5="";
}
}
}
if(_5!=null&&_5!=undefined&&((typeof _5)!="number"||!isNaN(_5))&&this.textbox.value!=_5){
this.textbox.value=_5;
this._set("displayedValue",this.get("displayedValue"));
}
if(this.textDir=="auto"){
this.applyTextDir(this.focusNode,_5);
}
this.inherited(arguments,[_6,_4]);
},displayedValue:"",_getDisplayedValueAttr:function(){
return this.filter(this.textbox.value);
},_setDisplayedValueAttr:function(_7){
if(_7===null||_7===undefined){
_7="";
}else{
if(typeof _7!="string"){
_7=String(_7);
}
}
this.textbox.value=_7;
this._setValueAttr(this.get("value"),undefined);
this._set("displayedValue",this.get("displayedValue"));
if(this.textDir=="auto"){
this.applyTextDir(this.focusNode,_7);
}
},format:function(_8,_9){
return ((_8==null||_8==undefined)?"":(_8.toString?_8.toString():_8));
},parse:function(_a,_b){
return _a;
},_refreshState:function(){
},onInput:function(){
},__skipInputEvent:false,_onInput:function(e){
if(this.textDir=="auto"){
this.applyTextDir(this.focusNode,this.focusNode.value);
}
this._refreshState();
this._set("displayedValue",this.get("displayedValue"));
},postCreate:function(){
this.textbox.setAttribute("value",this.textbox.value);
this.inherited(arguments);
var _c=function(e){
var _d=e.charOrCode||e.keyCode||229;
if(e.type=="keydown"){
switch(_d){
case _1.keys.SHIFT:
case _1.keys.ALT:
case _1.keys.CTRL:
case _1.keys.META:
case _1.keys.CAPS_LOCK:
return;
default:
if(_d>=65&&_d<=90){
return;
}
}
}
if(e.type=="keypress"&&typeof _d!="string"){
return;
}
if(e.type=="input"){
if(this.__skipInputEvent){
this.__skipInputEvent=false;
return;
}
}else{
this.__skipInputEvent=true;
}
var _e=_1.mixin({},e,{charOrCode:_d,wasConsumed:false,preventDefault:function(){
_e.wasConsumed=true;
e.preventDefault();
},stopPropagation:function(){
e.stopPropagation();
}});
if(this.onInput(_e)===false){
_1.stopEvent(_e);
}
if(_e.wasConsumed){
return;
}
setTimeout(_1.hitch(this,"_onInput",_e),0);
};
_1.forEach(["onkeydown","onkeypress","onpaste","oncut","oninput"],function(_f){
this.connect(this.textbox,_f,_c);
},this);
},_blankValue:"",filter:function(val){
if(val===null){
return this._blankValue;
}
if(typeof val!="string"){
return val;
}
if(this.trim){
val=_1.trim(val);
}
if(this.uppercase){
val=val.toUpperCase();
}
if(this.lowercase){
val=val.toLowerCase();
}
if(this.propercase){
val=val.replace(/[^\s]+/g,function(_10){
return _10.substring(0,1).toUpperCase()+_10.substring(1);
});
}
return val;
},_setBlurValue:function(){
this._setValueAttr(this.get("value"),true);
},_onBlur:function(e){
if(this.disabled){
return;
}
this._setBlurValue();
this.inherited(arguments);
if(this._selectOnClickHandle){
this.disconnect(this._selectOnClickHandle);
}
},_isTextSelected:function(){
return this.textbox.selectionStart==this.textbox.selectionEnd;
},_onFocus:function(by){
if(this.disabled||this.readOnly){
return;
}
if(this.selectOnClick&&by=="mouse"){
this._selectOnClickHandle=this.connect(this.domNode,"onmouseup",function(){
this.disconnect(this._selectOnClickHandle);
if(this._isTextSelected()){
_2.selectInputText(this.textbox);
}
});
}
this.inherited(arguments);
this._refreshState();
},reset:function(){
this.textbox.value="";
this.inherited(arguments);
},_setTextDirAttr:function(_11){
if(!this._created||this.textDir!=_11){
this._set("textDir",_11);
this.applyTextDir(this.focusNode,this.focusNode.value);
}
}});
_2._setSelectionRange=function(_12,_13,_14){
if(_12.setSelectionRange){
_12.setSelectionRange(_13,_14);
}
};
_2.selectInputText=function(_15,_16,_17){
var _18=_1.global;
var _19=_1.doc;
_15=_1.byId(_15);
if(isNaN(_16)){
_16=0;
}
if(isNaN(_17)){
_17=_15.value?_15.value.length:0;
}
try{
_15.focus();
_2._setSelectionRange(_15,_16,_17);
}
catch(e){
}
};
return _2.form._TextBoxMixin;
});
