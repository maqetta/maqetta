/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/LinkDialog",["dojo/_base/kernel","../..","../../_Widget","../_Plugin","../../TooltipDialog","../../form/DropDownButton","../../form/ValidationTextBox","../../form/Select","../range","dojo/i18n","dojo/string","dojo/i18n!../../nls/common","dojo/i18n!../nls/LinkDialog","dojo/_base/connect","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins.LinkDialog",_2._editor._Plugin,{buttonClass:_2.form.DropDownButton,useDefaultCommand:false,urlRegExp:"((https?|ftps?|file)\\://|./|/|)(/[a-zA-Z]{1,1}:/|)(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,80}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]{0,}(?:\\?[^?#\\s/]*)?(?:#.*)?)?)?",emailRegExp:"<?(mailto\\:)([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+"+"@"+"((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)+(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|localhost|^[^-][a-zA-Z0-9_-]*>?",htmlTemplate:"<a href=\"${urlInput}\" _djrealurl=\"${urlInput}\""+" target=\"${targetSelect}\""+">${textInput}</a>",tag:"a",_hostRxp:new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"),_userAtRxp:new RegExp("^([!#-'*+\\-\\/-9=?A-Z^-~]+[.])*[!#-'*+\\-\\/-9=?A-Z^-~]+@","i"),linkDialogTemplate:["<table><tr><td>","<label for='${id}_urlInput'>${url}</label>","</td><td>","<input dojoType='dijit.form.ValidationTextBox' required='true' "+"id='${id}_urlInput' name='urlInput' intermediateChanges='true'/>","</td></tr><tr><td>","<label for='${id}_textInput'>${text}</label>","</td><td>","<input dojoType='dijit.form.ValidationTextBox' required='true' id='${id}_textInput' "+"name='textInput' intermediateChanges='true'/>","</td></tr><tr><td>","<label for='${id}_targetSelect'>${target}</label>","</td><td>","<select id='${id}_targetSelect' name='targetSelect' dojoType='dijit.form.Select'>","<option selected='selected' value='_self'>${currentWindow}</option>","<option value='_blank'>${newWindow}</option>","<option value='_top'>${topWindow}</option>","<option value='_parent'>${parentWindow}</option>","</select>","</td></tr><tr><td colspan='2'>","<button dojoType='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>","<button dojoType='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>","</td></tr></table>"].join(""),_initButton:function(){
var _3=this;
this.tag=this.command=="insertImage"?"img":"a";
var _4=_1.delegate(_1.i18n.getLocalization("dijit","common",this.lang),_1.i18n.getLocalization("dijit._editor","LinkDialog",this.lang));
var _5=(this.dropDown=new _2.TooltipDialog({title:_4[this.command+"Title"],execute:_1.hitch(this,"setValue"),onOpen:function(){
_3._onOpenDialog();
_2.TooltipDialog.prototype.onOpen.apply(this,arguments);
},onCancel:function(){
setTimeout(_1.hitch(_3,"_onCloseDialog"),0);
}}));
_4.urlRegExp=this.urlRegExp;
_4.id=_2.getUniqueId(this.editor.id);
this._uniqueId=_4.id;
this._setContent(_5.title+"<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>"+_1.string.substitute(this.linkDialogTemplate,_4));
_5.startup();
this._urlInput=_2.byId(this._uniqueId+"_urlInput");
this._textInput=_2.byId(this._uniqueId+"_textInput");
this._setButton=_2.byId(this._uniqueId+"_setButton");
this.connect(_2.byId(this._uniqueId+"_cancelButton"),"onClick",function(){
this.dropDown.onCancel();
});
if(this._urlInput){
this.connect(this._urlInput,"onChange","_checkAndFixInput");
}
if(this._textInput){
this.connect(this._textInput,"onChange","_checkAndFixInput");
}
this._urlRegExp=new RegExp("^"+this.urlRegExp+"$","i");
this._emailRegExp=new RegExp("^"+this.emailRegExp+"$","i");
this._urlInput.isValid=_1.hitch(this,function(){
var _6=this._urlInput.get("value");
return this._urlRegExp.test(_6)||this._emailRegExp.test(_6);
});
this.connect(_5.domNode,"onkeypress",function(e){
if(e&&e.charOrCode==_1.keys.ENTER&&!e.shiftKey&&!e.metaKey&&!e.ctrlKey&&!e.altKey){
if(!this._setButton.get("disabled")){
_5.onExecute();
_5.execute(_5.get("value"));
}
}
});
this._connectTagEvents();
this.inherited(arguments);
},_checkAndFixInput:function(){
var _7=this;
var _8=this._urlInput.get("value");
var _9=function(_a){
var _b=false;
var _c=false;
if(_a&&_a.length>1){
_a=_1.trim(_a);
if(_a.indexOf("mailto:")!==0){
if(_a.indexOf("/")>0){
if(_a.indexOf("://")===-1){
if(_a.charAt(0)!=="/"&&_a.indexOf("./")!==0){
if(_7._hostRxp.test(_a)){
_b=true;
}
}
}
}else{
if(_7._userAtRxp.test(_a)){
_c=true;
}
}
}
}
if(_b){
_7._urlInput.set("value","http://"+_a);
}
if(_c){
_7._urlInput.set("value","mailto:"+_a);
}
_7._setButton.set("disabled",!_7._isValid());
};
if(this._delayedCheck){
clearTimeout(this._delayedCheck);
this._delayedCheck=null;
}
this._delayedCheck=setTimeout(function(){
_9(_8);
},250);
},_connectTagEvents:function(){
this.editor.onLoadDeferred.addCallback(_1.hitch(this,function(){
this.connect(this.editor.editNode,"ondblclick",this._onDblClick);
}));
},_isValid:function(){
return this._urlInput.isValid()&&this._textInput.isValid();
},_setContent:function(_d){
this.dropDown.set({parserScope:"dojo",content:_d});
},_checkValues:function(_e){
if(_e&&_e.urlInput){
_e.urlInput=_e.urlInput.replace(/"/g,"&quot;");
}
return _e;
},setValue:function(_f){
this._onCloseDialog();
if(_1.isIE<9){
var sel=_2.range.getSelection(this.editor.window);
var _10=sel.getRangeAt(0);
var a=_10.endContainer;
if(a.nodeType===3){
a=a.parentNode;
}
if(a&&(a.nodeName&&a.nodeName.toLowerCase()!==this.tag)){
a=_1.withGlobal(this.editor.window,"getSelectedElement",_2._editor.selection,[this.tag]);
}
if(a&&(a.nodeName&&a.nodeName.toLowerCase()===this.tag)){
if(this.editor.queryCommandEnabled("unlink")){
_1.withGlobal(this.editor.window,"selectElementChildren",_2._editor.selection,[a]);
this.editor.execCommand("unlink");
}
}
}
_f=this._checkValues(_f);
this.editor.execCommand("inserthtml",_1.string.substitute(this.htmlTemplate,_f));
},_onCloseDialog:function(){
this.editor.focus();
},_getCurrentValues:function(a){
var url,_11,_12;
if(a&&a.tagName.toLowerCase()===this.tag){
url=a.getAttribute("_djrealurl")||a.getAttribute("href");
_12=a.getAttribute("target")||"_self";
_11=a.textContent||a.innerText;
_1.withGlobal(this.editor.window,"selectElement",_2._editor.selection,[a,true]);
}else{
_11=_1.withGlobal(this.editor.window,_2._editor.selection.getSelectedText);
}
return {urlInput:url||"",textInput:_11||"",targetSelect:_12||""};
},_onOpenDialog:function(){
var a;
if(_1.isIE<9){
var sel=_2.range.getSelection(this.editor.window);
var _13=sel.getRangeAt(0);
a=_13.endContainer;
if(a.nodeType===3){
a=a.parentNode;
}
if(a&&(a.nodeName&&a.nodeName.toLowerCase()!==this.tag)){
a=_1.withGlobal(this.editor.window,"getSelectedElement",_2._editor.selection,[this.tag]);
}
}else{
a=_1.withGlobal(this.editor.window,"getAncestorElement",_2._editor.selection,[this.tag]);
}
this.dropDown.reset();
this._setButton.set("disabled",true);
this.dropDown.set("value",this._getCurrentValues(a));
},_onDblClick:function(e){
if(e&&e.target){
var t=e.target;
var tg=t.tagName?t.tagName.toLowerCase():"";
if(tg===this.tag&&_1.attr(t,"href")){
_1.withGlobal(this.editor.window,"selectElement",_2._editor.selection,[t]);
this.editor.onDisplayChanged();
setTimeout(_1.hitch(this,function(){
this.button.set("disabled",false);
this.button.openDropDown();
if(this.button.dropDown.focus){
this.button.dropDown.focus();
}
}),10);
}
}
}});
_1.declare("dijit._editor.plugins.ImgLinkDialog",[_2._editor.plugins.LinkDialog],{linkDialogTemplate:["<table><tr><td>","<label for='${id}_urlInput'>${url}</label>","</td><td>","<input dojoType='dijit.form.ValidationTextBox' regExp='${urlRegExp}' "+"required='true' id='${id}_urlInput' name='urlInput' intermediateChanges='true'/>","</td></tr><tr><td>","<label for='${id}_textInput'>${text}</label>","</td><td>","<input dojoType='dijit.form.ValidationTextBox' required='false' id='${id}_textInput' "+"name='textInput' intermediateChanges='true'/>","</td></tr><tr><td>","</td><td>","</td></tr><tr><td colspan='2'>","<button dojoType='dijit.form.Button' type='submit' id='${id}_setButton'>${set}</button>","<button dojoType='dijit.form.Button' type='button' id='${id}_cancelButton'>${buttonCancel}</button>","</td></tr></table>"].join(""),htmlTemplate:"<img src=\"${urlInput}\" _djrealurl=\"${urlInput}\" alt=\"${textInput}\" />",tag:"img",_getCurrentValues:function(img){
var url,_14;
if(img&&img.tagName.toLowerCase()===this.tag){
url=img.getAttribute("_djrealurl")||img.getAttribute("src");
_14=img.getAttribute("alt");
_1.withGlobal(this.editor.window,"selectElement",_2._editor.selection,[img,true]);
}else{
_14=_1.withGlobal(this.editor.window,_2._editor.selection.getSelectedText);
}
return {urlInput:url||"",textInput:_14||""};
},_isValid:function(){
return this._urlInput.isValid();
},_connectTagEvents:function(){
this.inherited(arguments);
this.editor.onLoadDeferred.addCallback(_1.hitch(this,function(){
this.connect(this.editor.editNode,"onmousedown",this._selectTag);
}));
},_selectTag:function(e){
if(e&&e.target){
var t=e.target;
var tg=t.tagName?t.tagName.toLowerCase():"";
if(tg===this.tag){
_1.withGlobal(this.editor.window,"selectElement",_2._editor.selection,[t]);
}
}
},_checkValues:function(_15){
if(_15&&_15.urlInput){
_15.urlInput=_15.urlInput.replace(/"/g,"&quot;");
}
if(_15&&_15.textInput){
_15.textInput=_15.textInput.replace(/"/g,"&quot;");
}
return _15;
},_onDblClick:function(e){
if(e&&e.target){
var t=e.target;
var tg=t.tagName?t.tagName.toLowerCase():"";
if(tg===this.tag&&_1.attr(t,"src")){
_1.withGlobal(this.editor.window,"selectElement",_2._editor.selection,[t]);
this.editor.onDisplayChanged();
setTimeout(_1.hitch(this,function(){
this.button.set("disabled",false);
this.button.openDropDown();
if(this.button.dropDown.focus){
this.button.dropDown.focus();
}
}),10);
}
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
switch(o.args.name){
case "createLink":
o.plugin=new _2._editor.plugins.LinkDialog({command:o.args.name});
break;
case "insertImage":
o.plugin=new _2._editor.plugins.ImgLinkDialog({command:o.args.name});
break;
}
});
return _2._editor.plugins.LinkDialog;
});
