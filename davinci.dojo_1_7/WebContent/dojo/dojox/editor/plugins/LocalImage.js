/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/editor/plugins/LocalImage",["dojo","dijit","dojox","dijit/_base/popup","dijit/_editor/plugins/LinkDialog","dijit/form/Button","dijit/form/DropDownButton","dojox/form/FileUploader","dojo/i18n","dojo/i18n!dojox/editor/plugins/nls/LocalImage"],function(_1,_2,_3){
_1.declare("dojox.editor.plugins.LocalImage",_2._editor.plugins.ImgLinkDialog,{uploadable:false,uploadUrl:"",baseImageUrl:"",fileMask:"*.jpg;*.jpeg;*.gif;*.png;*.bmp",urlRegExp:"",_fileUploader:null,htmlFieldName:"uploadedfile",_isLocalFile:false,_messages:"",_cssPrefix:"dijitEditorEilDialog",_closable:true,linkDialogTemplate:["<div style='border-bottom: 1px solid black; padding-bottom: 2pt; margin-bottom: 4pt;'></div>","<div class='dijitEditorEilDialogDescription'>${prePopuTextUrl}${prePopuTextBrowse}</div>","<table><tr><td colspan='2'>","<label for='${id}_urlInput' title='${prePopuTextUrl}${prePopuTextBrowse}'>${url}</label>","</td></tr><tr><td class='dijitEditorEilDialogField'>","<input dojoType='dijit.form.ValidationTextBox' class='dijitEditorEilDialogField'"+"regExp='${urlRegExp}' title='${prePopuTextUrl}${prePopuTextBrowse}'  selectOnClick='true' required='true' "+"id='${id}_urlInput' name='urlInput' intermediateChanges='true' invalidMessage='${invalidMessage}' "+"prePopuText='&lt;${prePopuTextUrl}${prePopuTextBrowse}&gt'>","</td><td>","<div id='${id}_browse' style='display:${uploadable}'>${browse}</div>","</td></tr><tr><td colspan='2'>","<label for='${id}_textInput'>${text}</label>","</td></tr><tr><td>","<input dojoType='dijit.form.TextBox' required='false' id='${id}_textInput' "+"name='textInput' intermediateChanges='true' selectOnClick='true' class='dijitEditorEilDialogField'>","</td><td></td></tr><tr><td>","</td><td>","</td></tr><tr><td colspan='2'>","<button dojoType='dijit.form.Button' id='${id}_setButton'>${set}</button>","</td></tr></table>"].join(""),_initButton:function(){
var _4=this,_5=(this._messages=_1.i18n.getLocalization("dojox.editor.plugins","LocalImage"));
this.tag="img";
var _6=(this.dropDown=new _2.TooltipDialog({title:_5[this.command+"Title"],onOpen:function(){
_4._initialFileUploader();
_4._onOpenDialog();
_2.TooltipDialog.prototype.onOpen.apply(this,arguments);
setTimeout(function(){
_2.selectInputText(_4._urlInput.textbox);
_4._urlInput.isLoadComplete=true;
},0);
},onClose:function(){
_1.disconnect(_4.blurHandler);
_4.blurHandler=null;
this.onHide();
},onCancel:function(){
setTimeout(_1.hitch(_4,"_onCloseDialog"),0);
}}));
var _7=this.getLabel(this.command),_8=this.iconClassPrefix+" "+this.iconClassPrefix+this.command.charAt(0).toUpperCase()+this.command.substr(1),_9=_1.mixin({label:_7,showLabel:false,iconClass:_8,dropDown:this.dropDown,tabIndex:"-1"},this.params||{});
if(!_1.isIE&&(!_1.isFF||_1.isFF<4)){
_9.closeDropDown=function(_a){
if(_4._closable){
if(this._opened){
_2.popup.close(this.dropDown);
if(_a){
this.focus();
}
this._opened=false;
this.state="";
}
}
setTimeout(function(){
_4._closable=true;
},10);
};
}
this.button=new _2.form.DropDownButton(_9);
var _b=this.fileMask.split(";"),_c="";
_1.forEach(_b,function(m){
m=m.replace(/\./,"\\.").replace(/\*/g,".*");
_c+="|"+m+"|"+m.toUpperCase();
});
_5.urlRegExp=this.urlRegExp=_c.substring(1);
if(!this.uploadable){
_5["prePopuTextBrowse"]=".";
}
_5.id=_2.getUniqueId(this.editor.id);
_5.uploadable=this.uploadable?"inline":"none";
this._uniqueId=_5.id;
this._setContent("<div class='"+this._cssPrefix+"Title'>"+_6.title+"</div>"+_1.string.substitute(this.linkDialogTemplate,_5));
_6.startup();
var _d=(this._urlInput=_2.byId(this._uniqueId+"_urlInput"));
this._textInput=_2.byId(this._uniqueId+"_textInput");
this._setButton=_2.byId(this._uniqueId+"_setButton");
if(_d){
var pt=_2.form.ValidationTextBox.prototype;
_d=_1.mixin(_d,{isLoadComplete:false,isValid:function(_e){
if(this.isLoadComplete){
return pt.isValid.apply(this,arguments);
}else{
return this.get("value").length>0;
}
},reset:function(){
this.isLoadComplete=false;
pt.reset.apply(this,arguments);
}});
this.connect(_d,"onKeyDown","_cancelFileUpload");
this.connect(_d,"onChange","_checkAndFixInput");
}
if(this._setButton){
this.connect(this._setButton,"onClick","_checkAndSetValue");
}
this._connectTagEvents();
},_initialFileUploader:function(){
var _f=null,_10=this,_11=_10._uniqueId,_12=_11+"_browse",_13=_10._urlInput;
if(_10.uploadable&&!_10._fileUploader){
_f=_10._fileUploader=new _3.form.FileUploader({force:"html",uploadUrl:_10.uploadUrl,htmlFieldName:_10.htmlFieldName,uploadOnChange:false,selectMultipleFiles:false,showProgress:true},_12);
_f.reset=function(){
_10._isLocalFile=false;
_f._resetHTML();
};
_10.connect(_f,"onClick",function(){
_13.validate(false);
if(!_1.isIE&&(!_1.isFF||_1.isFF<4)){
_10._closable=false;
}
});
_10.connect(_f,"onChange",function(_14){
_10._isLocalFile=true;
_13.set("value",_14[0].name);
_13.focus();
});
_10.connect(_f,"onComplete",function(_15){
var _16=_10.baseImageUrl;
_16=_16&&_16.charAt(_16.length-1)=="/"?_16:_16+"/";
_13.set("value",_16+_15[0].file);
_10._isLocalFile=false;
_10._setDialogStatus(true);
_10.setValue(_10.dropDown.get("value"));
});
_10.connect(_f,"onError",function(_17){
_10._setDialogStatus(true);
});
}
},_checkAndFixInput:function(){
this._setButton.set("disabled",!this._isValid());
},_isValid:function(){
return this._urlInput.isValid();
},_cancelFileUpload:function(){
this._fileUploader.reset();
this._isLocalFile=false;
},_checkAndSetValue:function(){
if(this._fileUploader&&this._isLocalFile){
this._setDialogStatus(false);
this._fileUploader.upload();
}else{
this.setValue(this.dropDown.get("value"));
}
},_setDialogStatus:function(_18){
this._urlInput.set("disabled",!_18);
this._textInput.set("disabled",!_18);
this._setButton.set("disabled",!_18);
},destroy:function(){
this.inherited(arguments);
if(this._fileUploader){
this._fileUploader.destroy();
this._fileUploader=null;
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _19=o.args.name.toLowerCase();
if(_19==="localimage"){
o.plugin=new _3.editor.plugins.LocalImage({command:"insertImage",uploadable:("uploadable" in o.args)?o.args.uploadable:false,uploadUrl:("uploadable" in o.args&&"uploadUrl" in o.args)?o.args.uploadUrl:"",htmlFieldName:("uploadable" in o.args&&"htmlFieldName" in o.args)?o.args.htmlFieldName:"uploadedfile",baseImageUrl:("uploadable" in o.args&&"baseImageUrl" in o.args)?o.args.baseImageUrl:"",fileMask:("fileMask" in o.args)?o.args.fileMask:"*.jpg;*.jpeg;*.gif;*.png;*.bmp"});
}
});
return _3.editor.plugins.LocalImage;
});
