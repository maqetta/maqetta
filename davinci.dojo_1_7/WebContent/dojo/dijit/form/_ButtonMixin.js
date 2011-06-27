/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_ButtonMixin",["dojo/_base/kernel","..","dojo/_base/event","dojo/_base/html"],function(_1,_2){
_1.declare("dijit.form._ButtonMixin",null,{label:"",type:"button",_onClick:function(e){
if(this.disabled){
_1.stopEvent(e);
return false;
}
var _3=this.onClick(e)===false;
if(!_3&&this.type=="submit"&&!(this.valueNode||this.focusNode).form){
for(var _4=this.domNode;_4.parentNode;_4=_4.parentNode){
var _5=_2.byNode(_4);
if(_5&&typeof _5._onSubmit=="function"){
_5._onSubmit(e);
_3=true;
break;
}
}
}
if(_3){
e.preventDefault();
}
return !_3;
},postCreate:function(){
this.inherited(arguments);
_1.setSelectable(this.focusNode,false);
},onClick:function(e){
return true;
},_setLabelAttr:function(_6){
this._set("label",_6);
(this.containerNode||this.focusNode).innerHTML=_6;
}});
return _2.form._ButtonMixin;
});
