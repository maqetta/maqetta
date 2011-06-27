/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_Templated",["dojo/_base/kernel",".","./_WidgetBase","./_TemplatedMixin","./_WidgetsInTemplateMixin","dojo/string","dojo/parser","dojo/cache","dojo/_base/array","dojo/_base/declare","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit._Templated",[_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{widgetsInTemplate:false,constructor:function(){
_1.deprecated(this.declaredClass+": dijit._Templated deprecated, use dijit._TemplatedMixin and if necessary dijit._WidgetsInTemplateMixin","","2.0");
},_attachTemplateNodes:function(_3,_4){
this.inherited(arguments);
var _5=_1.isArray(_3)?_3:(_3.all||_3.getElementsByTagName("*"));
var x=_1.isArray(_3)?0:-1;
for(;x<_5.length;x++){
var _6=(x==-1)?_3:_5[x];
var _7=_4(_6,"waiRole");
if(_7){
_6.setAttribute("role",_7);
}
var _8=_4(_6,"waiState");
if(_8){
_1.forEach(_8.split(/\s*,\s*/),function(_9){
if(_9.indexOf("-")!=-1){
var _a=_9.split("-");
_6.setAttribute("aria-"+_a[0],_a[1]);
}
});
}
}
}});
_1.extend(_2._WidgetBase,{waiRole:"",waiState:""});
return _2._Templated;
});
