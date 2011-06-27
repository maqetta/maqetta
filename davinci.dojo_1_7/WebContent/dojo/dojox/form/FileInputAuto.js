/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/FileInputAuto",["dojo","dijit","dojox","dojox/form/FileInput","dojo/io/iframe"],function(_1,_2,_3){
_1.getObject("dojox.form.FileInputAuto",1);
_1.declare("dojox.form.FileInputAuto",_3.form.FileInput,{url:"",blurDelay:2000,duration:500,uploadMessage:"Uploading ...",triggerEvent:"onblur",_sent:false,templateString:_1.cache("dojox.form","resources/FileInputAuto.html","<div class=\"dijitFileInput\">\n\t<input id=\"${id}\" name=\"${name}\" class=\"dijitFileInputReal\" type=\"file\" dojoAttachPoint=\"fileInput\" />\n\t<div class=\"dijitFakeInput\" dojoAttachPoint=\"fakeNodeHolder\">\n\t\t<input class=\"dijitFileInputVisible\" type=\"text\" dojoAttachPoint=\"focusNode, inputNode\" />\n\t\t<div class=\"dijitInline dijitFileInputText\" dojoAttachPoint=\"titleNode\">${label}</div>\n\t\t<div class=\"dijitInline dijitFileInputButton\" dojoAttachPoint=\"cancelNode\" dojoAttachEvent=\"onclick:reset\">${cancelText}</div>\n\t</div>\n\t<div class=\"dijitProgressOverlay\" dojoAttachPoint=\"overlay\">&nbsp;</div>\n</div>\n"),onBeforeSend:function(){
return {};
},startup:function(){
this._blurListener=this.connect(this.fileInput,this.triggerEvent,"_onBlur");
this._focusListener=this.connect(this.fileInput,"onfocus","_onFocus");
this.inherited(arguments);
},_onFocus:function(){
if(this._blurTimer){
clearTimeout(this._blurTimer);
}
},_onBlur:function(){
if(this._blurTimer){
clearTimeout(this._blurTimer);
}
if(!this._sent){
this._blurTimer=setTimeout(_1.hitch(this,"_sendFile"),this.blurDelay);
}
},setMessage:function(_4){
this.overlay.removeChild(this.overlay.firstChild);
this.overlay.appendChild(document.createTextNode(_4));
},_sendFile:function(e){
if(this._sent||this._sending||!this.fileInput.value){
return;
}
this._sending=true;
_1.style(this.fakeNodeHolder,"display","none");
_1.style(this.overlay,{opacity:0,display:"block"});
this.setMessage(this.uploadMessage);
_1.fadeIn({node:this.overlay,duration:this.duration}).play();
var _5;
if(_1.isIE<9||(_1.isIE&&_1.isQuirks)){
_5=document.createElement("<form enctype=\"multipart/form-data\" method=\"post\">");
_5.encoding="multipart/form-data";
}else{
_5=document.createElement("form");
_5.setAttribute("enctype","multipart/form-data");
}
_5.appendChild(this.fileInput);
_1.body().appendChild(_5);
_1.io.iframe.send({url:this.url,form:_5,handleAs:"json",handle:_1.hitch(this,"_handleSend"),content:this.onBeforeSend()});
},_handleSend:function(_6,_7){
this.overlay.removeChild(this.overlay.firstChild);
this._sent=true;
this._sending=false;
_1.style(this.overlay,{opacity:0,border:"none",background:"none"});
this.overlay.style.backgroundImage="none";
this.fileInput.style.display="none";
this.fakeNodeHolder.style.display="none";
_1.fadeIn({node:this.overlay,duration:this.duration}).play(250);
this.disconnect(this._blurListener);
this.disconnect(this._focusListener);
_1.body().removeChild(_7.args.form);
this.fileInput=null;
this.onComplete(_6,_7,this);
},reset:function(e){
if(this._blurTimer){
clearTimeout(this._blurTimer);
}
this.disconnect(this._blurListener);
this.disconnect(this._focusListener);
this.overlay.style.display="none";
this.fakeNodeHolder.style.display="";
this.inherited(arguments);
this._sent=false;
this._sending=false;
this._blurListener=this.connect(this.fileInput,this.triggerEvent,"_onBlur");
this._focusListener=this.connect(this.fileInput,"onfocus","_onFocus");
},onComplete:function(_8,_9,_a){
}});
_1.declare("dojox.form.FileInputBlind",_3.form.FileInputAuto,{startup:function(){
this.inherited(arguments);
this._off=_1.style(this.inputNode,"width");
this.inputNode.style.display="none";
this._fixPosition();
},_fixPosition:function(){
if(_1.isIE){
_1.style(this.fileInput,"width","1px");
}else{
_1.style(this.fileInput,"left","-"+(this._off)+"px");
}
},reset:function(e){
this.inherited(arguments);
this._fixPosition();
}});
return _1.getObject("dojox.form.FileInputAuto");
});
require(["dojox/form/FileInputAuto"]);
