/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_CheckBoxMixin",["dojo/_base/kernel","..","dojo/_base/declare","dojo/_base/event","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form._CheckBoxMixin",null,{type:"checkbox",value:"on",readOnly:false,_setReadOnlyAttr:function(_3){
this._set("readOnly",_3);
_1.attr(this.focusNode,"readOnly",_3);
this.focusNode.setAttribute("aria-readonly",_3);
},_setLabelAttr:undefined,postMixInProperties:function(){
if(this.value==""){
this.value="on";
}
this.inherited(arguments);
},reset:function(){
this.inherited(arguments);
this._set("value",this.params.value||"on");
_1.attr(this.focusNode,"value",this.value);
},_onClick:function(e){
if(this.readOnly){
_1.stopEvent(e);
return false;
}
return this.inherited(arguments);
}});
return _2.form._CheckBoxMixin;
});
