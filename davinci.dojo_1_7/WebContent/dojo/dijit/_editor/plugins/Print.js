/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/Print",["dojo/_base/kernel","../..","../../focus","../_Plugin","../../form/Button","dojo/i18n","dojo/i18n!../nls/commands","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2){
_1.declare("dijit._editor.plugins.Print",_2._editor._Plugin,{_initButton:function(){
var _3=_1.i18n.getLocalization("dijit._editor","commands"),_4=this.editor;
this.button=new _2.form.Button({label:_3["print"],dir:_4.dir,lang:_4.lang,showLabel:false,iconClass:this.iconClassPrefix+" "+this.iconClassPrefix+"Print",tabIndex:"-1",onClick:_1.hitch(this,"_print")});
},setEditor:function(_5){
this.editor=_5;
this._initButton();
this.editor.onLoadDeferred.addCallback(_1.hitch(this,function(){
if(!this.editor.iframe.contentWindow["print"]){
this.button.set("disabled",true);
}
}));
},updateState:function(){
var _6=this.get("disabled");
if(!this.editor.iframe.contentWindow["print"]){
_6=true;
}
this.button.set("disabled",_6);
},_print:function(){
var _7=this.editor.iframe;
if(_7.contentWindow["print"]){
if(!_1.isOpera&&!_1.isChrome){
_2.focus(_7);
_7.contentWindow.print();
}else{
var _8=this.editor.document;
var _9=this.editor.get("value");
_9="<html><head><meta http-equiv='Content-Type' "+"content='text/html; charset='UTF-8'></head><body>"+_9+"</body></html>";
var _a=window.open("javascript: ''","","status=0,menubar=0,location=0,toolbar=0,"+"width=1,height=1,resizable=0,scrollbars=0");
_a.document.open();
_a.document.write(_9);
_a.document.close();
var _b=[];
var _c=_8.getElementsByTagName("style");
if(_c){
var i;
for(i=0;i<_c.length;i++){
var _d=_c[i].innerHTML;
var _e=_a.document.createElement("style");
_e.appendChild(_a.document.createTextNode(_d));
_a.document.getElementsByTagName("head")[0].appendChild(_e);
}
}
_a.print();
_a.close();
}
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _f=o.args.name.toLowerCase();
if(_f==="print"){
o.plugin=new _2._editor.plugins.Print({command:"print"});
}
});
return _2._editor.plugins.Print;
});
