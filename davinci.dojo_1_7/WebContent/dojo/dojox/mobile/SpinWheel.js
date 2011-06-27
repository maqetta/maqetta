/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/SpinWheel",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./SpinWheelSlot"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
return _1.declare("dojox.mobile.SpinWheel",[dijit._WidgetBase,dijit._Container,dijit._Contained],{slotClasses:[],slotProps:[],centerPos:0,buildRendering:function(){
this.inherited(arguments);
_1.addClass(this.domNode,"mblSpinWheel");
this.centerPos=Math.round(this.domNode.offsetHeight/2);
this.slots=[];
for(var i=0;i<this.slotClasses.length;i++){
this.slots.push(((typeof this.slotClasses[i]=="string")?_1.getObject(this.slotClasses[i]):this.slotClasses[i])(this.slotProps[i]));
this.addChild(this.slots[i]);
}
_1.create("DIV",{className:"mblSpinWheelBar"},this.domNode);
},startup:function(){
this.inherited(arguments);
var _a=this;
setTimeout(function(){
_a.reset();
},0);
},getValue:function(){
var a=[];
_1.forEach(this.getChildren(),function(w){
if(w instanceof dojox.mobile.SpinWheelSlot){
a.push(w.getValue());
}
},this);
return a;
},setValue:function(a){
var i=0;
_1.forEach(this.getChildren(),function(w){
if(w instanceof dojox.mobile.SpinWheelSlot){
w.setValue(a[i]);
w.setColor(a[i]);
i++;
}
},this);
},reset:function(){
_1.forEach(this.getChildren(),function(w){
if(w instanceof dojox.mobile.SpinWheelSlot){
w.setInitialValue();
}
},this);
}});
});
