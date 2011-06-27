/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/ToggleDir",["dojo/_base/kernel","../..","../_Plugin","../../form/ToggleButton","dojo/_base/connect","dojo/_base/declare","dojo/_base/html","dojo/_base/lang"],function(_1,_2){
_1.experimental("dijit._editor.plugins.ToggleDir");
_1.declare("dijit._editor.plugins.ToggleDir",_2._editor._Plugin,{useDefaultCommand:false,command:"toggleDir",buttonClass:_2.form.ToggleButton,_initButton:function(){
this.inherited(arguments);
this.editor.onLoadDeferred.addCallback(_1.hitch(this,function(){
var _3=this.editor.editorObject.contentWindow.document.documentElement;
_3=_3.getElementsByTagName("body")[0];
var _4=_1.getComputedStyle(_3).direction=="ltr";
this.button.set("checked",!_4);
this.connect(this.button,"onChange","_setRtl");
}));
},updateState:function(){
this.button.set("disabled",this.get("disabled"));
},_setRtl:function(_5){
var _6="ltr";
if(_5){
_6="rtl";
}
var _7=this.editor.editorObject.contentWindow.document.documentElement;
_7=_7.getElementsByTagName("body")[0];
_7.dir=_6;
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
switch(o.args.name){
case "toggleDir":
o.plugin=new _2._editor.plugins.ToggleDir({command:o.args.name});
}
});
return _2._editor.plugins.ToggleDir;
});
