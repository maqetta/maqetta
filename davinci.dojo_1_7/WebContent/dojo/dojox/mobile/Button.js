/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/Button",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/form/_FormWidgetMixin","dijit/form/_ButtonMixin"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.Button",[dijit._WidgetBase,dijit.form._FormWidgetMixin,dijit.form._ButtonMixin],{baseClass:"mblButton",duration:1000,_onClick:function(e){
var _8=this.inherited(arguments);
if(_8&&this.duration>=0){
var _9=this.focusNode||this.domNode;
var _a=(this.baseClass+" "+this["class"]).split(" ");
_a=_1.map(_a,function(c){
return c+"Selected";
});
_1.addClass(_9,_a);
setTimeout(function(){
_1.removeClass(_9,_a);
},this.duration);
}
return _8;
},buildRendering:function(){
if(!this.srcNodeRef){
this.srcNodeRef=_1.create("button",{"type":this.type});
}
this.inherited(arguments);
this.focusNode=this.domNode;
},postCreate:function(){
this.inherited(arguments);
this.connect(this.domNode,"onclick","_onClick");
}});
});
