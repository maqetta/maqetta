/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_FormValueMixin",["dojo/_base/kernel","..","./_FormWidgetMixin","dojo/_base/connect","dojo/_base/declare","dojo/_base/html","dojo/_base/sniff"],function(_1,_2){
return _1.declare("dijit.form._FormValueMixin",_2.form._FormWidgetMixin,{readOnly:false,_setReadOnlyAttr:function(_3){
_1.attr(this.focusNode,"readOnly",_3);
this.focusNode.setAttribute("aria-readonly",_3);
this._set("readOnly",_3);
},postCreate:function(){
this.inherited(arguments);
if(_1.isIE){
this.connect(this.focusNode||this.domNode,"onkeydown",this._onKeyDown);
}
if(this._resetValue===undefined){
this._lastValueReported=this._resetValue=this.value;
}
},_setValueAttr:function(_4,_5){
this._handleOnChange(_4,_5);
},_handleOnChange:function(_6,_7){
this._set("value",_6);
this.inherited(arguments);
},undo:function(){
this._setValueAttr(this._lastValueReported,false);
},reset:function(){
this._hasBeenBlurred=false;
this._setValueAttr(this._resetValue,true);
},_onKeyDown:function(e){
if(e.keyCode==_1.keys.ESCAPE&&!(e.ctrlKey||e.altKey||e.metaKey)){
var te;
if(_1.isIE<9||(_1.isIE&&_1.isQuirks)){
e.preventDefault();
te=document.createEventObject();
te.keyCode=_1.keys.ESCAPE;
te.shiftKey=e.shiftKey;
e.srcElement.fireEvent("onkeypress",te);
}
}
}});
});
