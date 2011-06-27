/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mvc/Repeat",["dojo/_base/declare","./_Container"],function(_1,_2){
return _1("dojox.mvc.Repeat",[_2],{index:0,postscript:function(_3,_4){
this.srcNodeRef=dojo.byId(_4);
if(this.srcNodeRef){
this.templateString=this.srcNodeRef.innerHTML;
this.srcNodeRef.innerHTML="";
}
this.inherited(arguments);
},_updateBinding:function(_5,_6,_7){
this.inherited(arguments);
this._buildContained();
},_buildContained:function(){
this._destroyBody();
this._updateAddRemoveWatch();
var _8="";
for(this.index=0;this.get("binding").get(this.index);this.index++){
_8+=this._exprRepl(this.templateString);
}
var _9=this.srcNodeRef||this.domNode;
_9.innerHTML=_8;
this._createBody();
},_updateAddRemoveWatch:function(){
if(this._addRemoveWatch){
this._addRemoveWatch.unwatch();
}
var _a=this;
this._addRemoveWatch=this.get("binding").watch(function(_b,_c,_d){
if(/^[0-9]+$/.test(_b.toString())){
if(!_c||!_d){
_a._buildContained();
}
}
});
}});
});
