/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ToggleButtonMixin",["dojo/_base/kernel","..","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form._ToggleButtonMixin",null,{checked:false,_onClick:function(_3){
var _4=this.checked;
this._set("checked",!_4);
var _5=this.inherited(arguments);
this.set("checked",_5?this.checked:_4);
return _5;
},_setCheckedAttr:function(_6,_7){
this._set("checked",_6);
_1.attr(this.focusNode||this.domNode,"checked",_6);
(this.focusNode||this.domNode).setAttribute("aria-pressed",_6);
this._handleOnChange(_6,_7);
},reset:function(){
this._hasBeenBlurred=false;
this.set("checked",this.params.checked||false);
}});
return _2.form._ToggleButtonMixin;
});
