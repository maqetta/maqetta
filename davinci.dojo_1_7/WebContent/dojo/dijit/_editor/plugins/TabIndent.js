/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/TabIndent",["dojo/_base/kernel","../..","../_Plugin","../../form/ToggleButton","dojo/_base/connect","dojo/_base/declare"],function(_1,_2){
_1.experimental("dijit._editor.plugins.TabIndent");
_1.declare("dijit._editor.plugins.TabIndent",_2._editor._Plugin,{useDefaultCommand:false,buttonClass:_2.form.ToggleButton,command:"tabIndent",_initButton:function(){
this.inherited(arguments);
var e=this.editor;
this.connect(this.button,"onChange",function(_3){
e.set("isTabIndent",_3);
});
this.updateState();
},updateState:function(){
var _4=this.get("disabled");
this.button.set("disabled",_4);
if(_4){
return;
}
this.button.set("checked",this.editor.isTabIndent,false);
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
switch(o.args.name){
case "tabIndent":
o.plugin=new _2._editor.plugins.TabIndent({command:o.args.name});
}
});
return _2._editor.plugins.TabIndent;
});
