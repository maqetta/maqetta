/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/calc/FuncGen",["dojo","dijit/_Templated","dojox/math/_base","dijit/dijit","dijit/form/ComboBox","dijit/form/SimpleTextarea","dijit/form/Button","dojo/data/ItemFileWriteStore"],function(_1){
_1.experimental("dojox.calc.FuncGen");
_1.declare("dojox.calc.FuncGen",[dijit._Widget,dijit._Templated],{templateString:_1.cache("dojox.calc","templates/FuncGen.html"),widgetsInTemplate:true,onSelect:function(){
this.reset();
},onClear:function(){
var _2=confirm("Do you want to clear the name, argument, and body text?");
if(_2){
this.clear();
}
},saveFunction:function(_3,_4,_5){
},onSaved:function(){
},clear:function(){
this.textarea.set("value","");
this.args.set("value","");
this.combo.set("value","");
},reset:function(){
if(this.combo.get("value") in this.functions){
this.textarea.set("value",this.functions[this.combo.get("value")].body);
this.args.set("value",this.functions[this.combo.get("value")].args);
}
},onReset:function(){
if(this.combo.get("value") in this.functions){
var _6=confirm("Do you want to reset this function?");
if(_6){
this.reset();
this.status.set("value","The function has been reset to its last save point.");
}
}
},deleteThing:function(_7){
if(this.writeStore.isItem(_7)){
this.writeStore.deleteItem(_7);
this.writeStore.save();
}else{
}
},deleteFunction:function(_8){
},onDelete:function(){
var _9;
if((_9=this.combo.get("value")) in this.functions){
var _a=confirm("Do you want to delete this function?");
if(_a){
var _b=this.combo.item;
this.writeStore.deleteItem(_b);
this.writeStore.save();
this.deleteFunction(_9);
delete this.functions[_9];
this.clear();
}
}else{
this.status.set("value","Function cannot be deleted, it isn't saved.");
}
},readyStatus:function(){
this.status.set("value","Ready");
},writeStore:null,readStore:null,functions:null,startup:function(){
this.combo.set("store",this.writeStore);
this.inherited(arguments);
var _c=dijit.getEnclosingWidget(this.domNode.parentNode);
if(_c&&typeof _c.close=="function"){
this.closeButton.set("onClick",_1.hitch(_c,"close"));
}else{
_1.style(this.closeButton.domNode,"display","none");
}
}});
return dojox.calc.FuncGen;
});
