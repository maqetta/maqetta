/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/NewPage",["dojo/_base/kernel","../..","../_Plugin","../../form/Button","dojo/i18n","dojo/i18n!../nls/commands","dojo/_base/lang"],function(_1,_2){
_1.declare("dijit._editor.plugins.NewPage",_2._editor._Plugin,{content:"<br>",_initButton:function(){
var _3=_1.i18n.getLocalization("dijit._editor","commands"),_4=this.editor;
this.button=new _2.form.Button({label:_3["newPage"],dir:_4.dir,lang:_4.lang,showLabel:false,iconClass:this.iconClassPrefix+" "+this.iconClassPrefix+"NewPage",tabIndex:"-1",onClick:_1.hitch(this,"_newPage")});
},setEditor:function(_5){
this.editor=_5;
this._initButton();
},updateState:function(){
this.button.set("disabled",this.get("disabled"));
},_newPage:function(){
this.editor.beginEditing();
this.editor.set("value",this.content);
this.editor.endEditing();
this.editor.focus();
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _6=o.args.name.toLowerCase();
if(_6==="newpage"){
o.plugin=new _2._editor.plugins.NewPage({content:("content" in o.args)?o.args.content:"<br>"});
}
});
return _2._editor.plugins.NewPage;
});
