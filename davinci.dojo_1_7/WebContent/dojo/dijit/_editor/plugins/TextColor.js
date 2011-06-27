/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/TextColor",["dojo/_base/kernel","../..","../_Plugin","../../form/DropDownButton","../../ColorPalette","dojo/colors"],function(_1,_2){
_1.declare("dijit._editor.plugins.TextColor",_2._editor._Plugin,{buttonClass:_2.form.DropDownButton,useDefaultCommand:false,constructor:function(){
this.dropDown=new _2.ColorPalette();
this.connect(this.dropDown,"onChange",function(_3){
this.editor.execCommand(this.command,_3);
});
},updateState:function(){
var _4=this.editor;
var _5=this.command;
if(!_4||!_4.isLoaded||!_5.length){
return;
}
if(this.button){
var _6=this.get("disabled");
this.button.set("disabled",_6);
if(_6){
return;
}
var _7;
try{
_7=_4.queryCommandValue(_5)||"";
}
catch(e){
_7="";
}
}
if(_7==""){
_7="#000000";
}
if(_7=="transparent"){
_7="#ffffff";
}
if(typeof _7=="string"){
if(_7.indexOf("rgb")>-1){
_7=_1.colorFromRgb(_7).toHex();
}
}else{
_7=((_7&255)<<16)|(_7&65280)|((_7&16711680)>>>16);
_7=_7.toString(16);
_7="#000000".slice(0,7-_7.length)+_7;
}
if(_7!==this.dropDown.get("value")){
this.dropDown.set("value",_7,false);
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
switch(o.args.name){
case "foreColor":
case "hiliteColor":
o.plugin=new _2._editor.plugins.TextColor({command:o.args.name});
}
});
return _2._editor.plugins.TextColor;
});
