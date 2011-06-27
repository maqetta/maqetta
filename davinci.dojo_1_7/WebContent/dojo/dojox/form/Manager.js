/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/Manager",["dojo","dijit","dojox","dijit/_Widget","dijit/_TemplatedMixin","dojox/form/manager/_Mixin","dojox/form/manager/_NodeMixin","dojox/form/manager/_FormMixin","dojox/form/manager/_ValueMixin","dojox/form/manager/_EnableMixin","dojox/form/manager/_DisplayMixin","dojox/form/manager/_ClassMixin"],function(_1,_2,_3){
_1.getObject("dojox.form.Manager",1);
_1.declare("dojox.form.Manager",[_2._Widget,_3.form.manager._Mixin,_3.form.manager._NodeMixin,_3.form.manager._FormMixin,_3.form.manager._ValueMixin,_3.form.manager._EnableMixin,_3.form.manager._DisplayMixin,_3.form.manager._ClassMixin],{buildRendering:function(){
var _4=(this.domNode=this.srcNodeRef);
if(!this.containerNode){
this.containerNode=_4;
}
this.inherited(arguments);
this._attachPoints=[];
this._attachEvents=[];
_2._TemplatedMixin.prototype._attachTemplateNodes.call(this,_4,function(n,p){
return n.getAttribute(p);
});
},destroyRendering:function(_5){
if(!this.__ctm){
this.__ctm=true;
_2._TemplatedMixin.prototype.destroyRendering.apply(this,arguments);
delete this.__ctm;
this.inherited(arguments);
}
}});
return _1.getObject("dojox.form.Manager");
});
require(["dojox/form/Manager"]);
