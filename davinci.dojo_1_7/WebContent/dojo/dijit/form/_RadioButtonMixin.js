/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_RadioButtonMixin",["dojo/_base/kernel","..","dojo/_base/NodeList","dojo/_base/array","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit.form._RadioButtonMixin",null,{type:"radio",_getRelatedWidgets:function(){
var _3=[];
_1.query("input[type=radio]",this.focusNode.form||_1.doc).forEach(_1.hitch(this,function(_4){
if(_4.name==this.name&&_4.form==this.focusNode.form){
var _5=_2.getEnclosingWidget(_4);
if(_5){
_3.push(_5);
}
}
}));
return _3;
},_setCheckedAttr:function(_6){
this.inherited(arguments);
if(!this._created){
return;
}
if(_6){
_1.forEach(this._getRelatedWidgets(),_1.hitch(this,function(_7){
if(_7!=this&&_7.checked){
_7.set("checked",false);
}
}));
}
},_onClick:function(e){
if(this.checked||this.disabled){
_1.stopEvent(e);
return false;
}
if(this.readOnly){
_1.stopEvent(e);
_1.forEach(this._getRelatedWidgets(),_1.hitch(this,function(_8){
_1.attr(this.focusNode||this.domNode,"checked",_8.checked);
}));
return false;
}
return this.inherited(arguments);
}});
return _2.form._RadioButtonMixin;
});
