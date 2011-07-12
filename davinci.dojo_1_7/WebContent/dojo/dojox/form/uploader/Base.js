/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/uploader/Base",["dojo","dijit","dijit/_Widget","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(_1,_2){
_1.declare("dojox.form.uploader.Base",[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{getForm:function(){
if(!this.form){
var n=this.domNode;
while(n&&n.tagName&&n!==document.body){
if(n.tagName.toLowerCase()=="form"){
this.form=n;
break;
}
n=n.parentNode;
}
}
return this.form;
},getUrl:function(){
if(this.uploadUrl){
this.url=this.uploadUrl;
}
if(this.url){
return this.url;
}
if(this.getForm()){
this.url=this.form.action;
}
return this.url;
},connectForm:function(){
this.url=this.getUrl();
if(!this._fcon&&!!this.getForm()){
this._fcon=true;
this.connect(this.form,"onsubmit",function(_3){
_1.stopEvent(_3);
this.submit(_1.formToObject(this.form));
});
}
},supports:function(_4){
if(!this._hascache){
this._hascache={testDiv:_1.create("div"),testInput:_1.create("input",{type:"file"}),xhr:!!window.XMLHttpRequest?new XMLHttpRequest():{}};
_1.style(this._hascache.testDiv,"opacity",0.7);
}
switch(_4){
case "FormData":
if(_1.isFF&&this.uploadOnSelect){
return false;
}
return !!window.FormData;
case "sendAsBinary":
return !!this._hascache.xhr.sendAsBinary;
case "opacity":
return _1.style(this._hascache.testDiv,"opacity")==0.7;
case "multiple":
if(this.force=="flash"||this.force=="iframe"){
return false;
}
var _5=_1.attr(this._hascache.testInput,"multiple");
return _5===true||_5===false;
}
return false;
},getMimeType:function(){
return "application/octet-stream";
},getFileType:function(_6){
return _6.substring(_6.lastIndexOf(".")+1).toUpperCase();
},convertBytes:function(_7){
var kb=Math.round(_7/1024*100000)/100000;
var mb=Math.round(_7/1048576*100000)/100000;
var gb=Math.round(_7/1073741824*100000)/100000;
var _8=_7;
if(kb>1){
_8=kb.toFixed(1)+" kb";
}
if(mb>1){
_8=mb.toFixed(1)+" mb";
}
if(gb>1){
_8=gb.toFixed(1)+" gb";
}
return {kb:kb,mb:mb,gb:gb,bytes:_7,value:_8};
}});
return dojox.form.uploader.Base;
});
