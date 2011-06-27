/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_FormWidgetMixin",["dojo/_base/kernel","..","dojo/window","dojo/_base/array","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window","dojo/mouse"],function(_1,_2){
return _1.declare("dijit.form._FormWidgetMixin",null,{name:"",alt:"",value:"",type:"text",tabIndex:"0",_setTabIndexAttr:"focusNode",disabled:false,intermediateChanges:false,scrollOnFocus:true,_setIdAttr:"focusNode",postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onmousedown","_onMouseDown");
},_setDisabledAttr:function(_3){
this._set("disabled",_3);
_1.attr(this.focusNode,"disabled",_3);
if(this.valueNode){
_1.attr(this.valueNode,"disabled",_3);
}
this.focusNode.setAttribute("aria-disabled",_3);
if(_3){
this._set("hovering",false);
this._set("active",false);
var _4="tabIndex" in this.attributeMap?this.attributeMap.tabIndex:("_setTabIndexAttr" in this)?this._setTabIndexAttr:"focusNode";
_1.forEach(_1.isArray(_4)?_4:[_4],function(_5){
var _6=this[_5];
if(_1.isWebKit||_2.hasDefaultTabStop(_6)){
_6.setAttribute("tabIndex","-1");
}else{
_6.removeAttribute("tabIndex");
}
},this);
}else{
if(this.tabIndex!=""){
this.set("tabIndex",this.tabIndex);
}
}
},_onFocus:function(e){
if(this.scrollOnFocus){
_1.window.scrollIntoView(this.domNode);
}
this.inherited(arguments);
},isFocusable:function(){
return !this.disabled&&this.focusNode&&(_1.style(this.domNode,"display")!="none");
},focus:function(){
if(!this.disabled&&this.focusNode.focus){
try{
this.focusNode.focus();
}
catch(e){
}
}
},compare:function(_7,_8){
if(typeof _7=="number"&&typeof _8=="number"){
return (isNaN(_7)&&isNaN(_8))?0:_7-_8;
}else{
if(_7>_8){
return 1;
}else{
if(_7<_8){
return -1;
}else{
return 0;
}
}
}
},onChange:function(_9){
},_onChangeActive:false,_handleOnChange:function(_a,_b){
if(this._lastValueReported==undefined&&(_b===null||!this._onChangeActive)){
this._resetValue=this._lastValueReported=_a;
}
this._pendingOnChange=this._pendingOnChange||(typeof _a!=typeof this._lastValueReported)||(this.compare(_a,this._lastValueReported)!=0);
if((this.intermediateChanges||_b||_b===undefined)&&this._pendingOnChange){
this._lastValueReported=_a;
this._pendingOnChange=false;
if(this._onChangeActive){
if(this._onChangeHandle){
clearTimeout(this._onChangeHandle);
}
this._onChangeHandle=setTimeout(_1.hitch(this,function(){
this._onChangeHandle=null;
this.onChange(_a);
}),0);
}
}
},create:function(){
this.inherited(arguments);
this._onChangeActive=true;
},destroy:function(){
if(this._onChangeHandle){
clearTimeout(this._onChangeHandle);
this.onChange(this._lastValueReported);
}
this.inherited(arguments);
},_onMouseDown:function(e){
if(!e.ctrlKey&&_1.mouseButtons.isLeft(e)&&this.isFocusable()){
var _c=this.connect(_1.body(),"onmouseup",function(){
if(this.isFocusable()){
this.focus();
}
this.disconnect(_c);
});
}
}});
});
