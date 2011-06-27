/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/_FormWidget",["dojo/_base/kernel","..","dojo/window","../_Widget","../_TemplatedMixin","../_CssStateMixin","./_FormValueMixin","./_FormWidgetMixin","dojo/_base/sniff"],function(_1,_2){
_1.declare("dijit.form._FormWidget",[_2._Widget,_2._TemplatedMixin,_2._CssStateMixin,_2.form._FormWidgetMixin],{setDisabled:function(_3){
_1.deprecated("setDisabled("+_3+") is deprecated. Use set('disabled',"+_3+") instead.","","2.0");
this.set("disabled",_3);
},setValue:function(_4){
_1.deprecated("dijit.form._FormWidget:setValue("+_4+") is deprecated.  Use set('value',"+_4+") instead.","","2.0");
this.set("value",_4);
},getValue:function(){
_1.deprecated(this.declaredClass+"::getValue() is deprecated. Use get('value') instead.","","2.0");
return this.get("value");
},postMixInProperties:function(){
this.nameAttrSetting=this.name?("name=\""+this.name.replace(/'/g,"&quot;")+"\""):"";
this.inherited(arguments);
},_setTypeAttr:null});
_1.declare("dijit.form._FormValueWidget",[_2.form._FormWidget,_2.form._FormValueMixin],{_layoutHackIE7:function(){
if(_1.isIE==7){
var _5=this.domNode;
var _6=_5.parentNode;
var _7=_5.firstChild||_5;
var _8=_7.style.filter;
var _9=this;
while(_6&&_6.clientHeight==0){
(function ping(){
var _a=_9.connect(_6,"onscroll",function(e){
_9.disconnect(_a);
_7.style.filter=(new Date()).getMilliseconds();
setTimeout(function(){
_7.style.filter=_8;
},0);
});
})();
_6=_6.parentNode;
}
}
}});
return _2.form._FormWidget;
});
