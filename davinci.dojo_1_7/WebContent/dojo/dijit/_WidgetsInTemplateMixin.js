/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_WidgetsInTemplateMixin",["dojo/_base/kernel",".","dojo/parser","dojo/_base/array","dojo/_base/declare"],function(_1,_2){
_1.declare("dijit._WidgetsInTemplateMixin",null,{_earlyTemplatedStartup:false,widgetsInTemplate:true,_beforeFillContent:function(){
if(this.widgetsInTemplate){
var _3=this.domNode;
var cw=(this._startupWidgets=_1.parser.parse(_3,{noStart:!this._earlyTemplatedStartup,template:true,inherited:{dir:this.dir,lang:this.lang,textDir:this.textDir},propsThis:this,scope:"dojo"}));
this._supportingWidgets=_2.findWidgets(_3);
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
},startup:function(){
_1.forEach(this._startupWidgets,function(w){
if(w&&!w._started&&w.startup){
w.startup();
}
});
this.inherited(arguments);
}});
return _2._WidgetsInTemplateMixin;
});
