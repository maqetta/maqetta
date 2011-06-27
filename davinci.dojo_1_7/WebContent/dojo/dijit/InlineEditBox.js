/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dijit/templates/InlineEditBox.html"]="<span data-dojo-attach-point=\"editNode\" role=\"presentation\" style=\"position: absolute; visibility:hidden\" class=\"dijitReset dijitInline\"\n\tdata-dojo-attach-event=\"onkeypress: _onKeyPress\"\n\t><span data-dojo-attach-point=\"editorPlaceholder\"></span\n\t><span data-dojo-attach-point=\"buttonContainer\"\n\t\t><button data-dojo-type=\"dijit.form.Button\" data-dojo-props=\"label: '${buttonSave}', 'class': 'saveButton'\"\n\t\t\tdata-dojo-attach-point=\"saveButton\" data-dojo-attach-event=\"onClick:save\"></button\n\t\t><button data-dojo-type=\"dijit.form.Button\"  data-dojo-props=\"label: '${buttonCancel}', 'class': 'cancelButton'\"\n\t\t\tdata-dojo-attach-point=\"cancelButton\" data-dojo-attach-event=\"onClick:cancel\"></button\n\t></span\n></span>\n";
define("dijit/InlineEditBox",["dojo/_base/kernel",".","dojo/text!./templates/InlineEditBox.html","dojo/i18n","./_Widget","./_TemplatedMixin","./_WidgetsInTemplateMixin","./_Container","./form/Button","./form/TextBox","./focus","dojo/i18n!./nls/common","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff"],function(_1,_2,_3){
_1.declare("dijit.InlineEditBox",_2._Widget,{editing:false,autoSave:true,buttonSave:"",buttonCancel:"",renderAsHtml:false,editor:"dijit.form.TextBox",editorWrapper:"dijit._InlineEditor",editorParams:{},disabled:false,onChange:function(_4){
},onCancel:function(){
},width:"100%",value:"",noValueIndicator:_1.isIE<=6?"<span style='font-family: wingdings; text-decoration: underline;'>&nbsp;&nbsp;&nbsp;&nbsp;&#x270d;&nbsp;&nbsp;&nbsp;&nbsp;</span>":"<span style='text-decoration: underline;'>&nbsp;&nbsp;&nbsp;&nbsp;&#x270d;&nbsp;&nbsp;&nbsp;&nbsp;</span>",constructor:function(){
this.editorParams={};
},postMixInProperties:function(){
this.inherited(arguments);
this.displayNode=this.srcNodeRef;
var _5={ondijitclick:"_onClick",onmouseover:"_onMouseOver",onmouseout:"_onMouseOut",onfocus:"_onMouseOver",onblur:"_onMouseOut"};
for(var _6 in _5){
this.connect(this.displayNode,_6,_5[_6]);
}
this.displayNode.setAttribute("role","button");
if(!this.displayNode.getAttribute("tabIndex")){
this.displayNode.setAttribute("tabIndex",0);
}
if(!this.value&&!("value" in this.params)){
this.value=_1.trim(this.renderAsHtml?this.displayNode.innerHTML:(this.displayNode.innerText||this.displayNode.textContent||""));
}
if(!this.value){
this.displayNode.innerHTML=this.noValueIndicator;
}
_1.addClass(this.displayNode,"dijitInlineEditBoxDisplayMode");
},setDisabled:function(_7){
_1.deprecated("dijit.InlineEditBox.setDisabled() is deprecated.  Use set('disabled', bool) instead.","","2.0");
this.set("disabled",_7);
},_setDisabledAttr:function(_8){
this.domNode.setAttribute("aria-disabled",_8);
if(_8){
this.displayNode.removeAttribute("tabIndex");
}else{
this.displayNode.setAttribute("tabIndex",0);
}
_1.toggleClass(this.displayNode,"dijitInlineEditBoxDisplayModeDisabled",_8);
this._set("disabled",_8);
},_onMouseOver:function(){
if(!this.disabled){
_1.addClass(this.displayNode,"dijitInlineEditBoxDisplayModeHover");
}
},_onMouseOut:function(){
_1.removeClass(this.displayNode,"dijitInlineEditBoxDisplayModeHover");
},_onClick:function(e){
if(this.disabled){
return;
}
if(e){
_1.stopEvent(e);
}
this._onMouseOut();
setTimeout(_1.hitch(this,"edit"),0);
},edit:function(){
if(this.disabled||this.editing){
return;
}
this.editing=true;
this._savedPosition=_1.style(this.displayNode,"position")||"static";
this._savedOpacity=_1.style(this.displayNode,"opacity")||"1";
this._savedTabIndex=_1.attr(this.displayNode,"tabIndex")||"0";
if(this.wrapperWidget){
var ew=this.wrapperWidget.editWidget;
ew.set("displayedValue" in ew?"displayedValue":"value",this.value);
}else{
var _9=_1.create("span",null,this.domNode,"before");
var _a=typeof this.editorWrapper=="string"?_1.getObject(this.editorWrapper):this.editorWrapper;
this.wrapperWidget=new _a({value:this.value,buttonSave:this.buttonSave,buttonCancel:this.buttonCancel,dir:this.dir,lang:this.lang,tabIndex:this._savedTabIndex,editor:this.editor,inlineEditBox:this,sourceStyle:_1.getComputedStyle(this.displayNode),save:_1.hitch(this,"save"),cancel:_1.hitch(this,"cancel")},_9);
if(!this._started){
this.startup();
}
}
var ww=this.wrapperWidget;
_1.style(this.displayNode,{position:"absolute",opacity:"0"});
_1.style(ww.domNode,{position:this._savedPosition,visibility:"visible",opacity:"1"});
_1.attr(this.displayNode,"tabIndex","-1");
setTimeout(_1.hitch(ww,function(){
this.focus();
this._resetValue=this.getValue();
}),0);
},_onBlur:function(){
this.inherited(arguments);
if(!this.editing){
}
},destroy:function(){
if(this.wrapperWidget&&!this.wrapperWidget._destroyed){
this.wrapperWidget.destroy();
delete this.wrapperWidget;
}
this.inherited(arguments);
},_showText:function(_b){
var ww=this.wrapperWidget;
_1.style(ww.domNode,{position:"absolute",visibility:"hidden",opacity:"0"});
_1.style(this.displayNode,{position:this._savedPosition,opacity:this._savedOpacity});
_1.attr(this.displayNode,"tabIndex",this._savedTabIndex);
if(_b){
_2.focus(this.displayNode);
}
},save:function(_c){
if(this.disabled||!this.editing){
return;
}
this.editing=false;
var ww=this.wrapperWidget;
var _d=ww.getValue();
this.set("value",_d);
this._showText(_c);
},setValue:function(_e){
_1.deprecated("dijit.InlineEditBox.setValue() is deprecated.  Use set('value', ...) instead.","","2.0");
return this.set("value",_e);
},_setValueAttr:function(_f){
_f=_1.trim(_f);
var _10=this.renderAsHtml?_f:_f.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;").replace(/\n/g,"<br>");
this.displayNode.innerHTML=_10||this.noValueIndicator;
this._set("value",_f);
if(this._started){
setTimeout(_1.hitch(this,"onChange",_f),0);
}
},getValue:function(){
_1.deprecated("dijit.InlineEditBox.getValue() is deprecated.  Use get('value') instead.","","2.0");
return this.get("value");
},cancel:function(_11){
if(this.disabled||!this.editing){
return;
}
this.editing=false;
setTimeout(_1.hitch(this,"onCancel"),0);
this._showText(_11);
}});
_1.declare("dijit._InlineEditor",[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{templateString:_3,postMixInProperties:function(){
this.inherited(arguments);
this.messages=_1.i18n.getLocalization("dijit","common",this.lang);
_1.forEach(["buttonSave","buttonCancel"],function(_12){
if(!this[_12]){
this[_12]=this.messages[_12];
}
},this);
},buildRendering:function(){
this.inherited(arguments);
var cls=typeof this.editor=="string"?_1.getObject(this.editor):this.editor;
var _13=this.sourceStyle,_14="line-height:"+_13.lineHeight+";",_15=_1.getComputedStyle(this.domNode);
_1.forEach(["Weight","Family","Size","Style"],function(_16){
var _17=_13["font"+_16],_18=_15["font"+_16];
if(_18!=_17){
_14+="font-"+_16+":"+_13["font"+_16]+";";
}
},this);
_1.forEach(["marginTop","marginBottom","marginLeft","marginRight"],function(_19){
this.domNode.style[_19]=_13[_19];
},this);
var _1a=this.inlineEditBox.width;
if(_1a=="100%"){
_14+="width:100%;";
this.domNode.style.display="block";
}else{
_14+="width:"+(_1a+(Number(_1a)==_1a?"px":""))+";";
}
var _1b=_1.delegate(this.inlineEditBox.editorParams,{style:_14,dir:this.dir,lang:this.lang});
_1b["displayedValue" in cls.prototype?"displayedValue":"value"]=this.value;
this.editWidget=new cls(_1b,this.editorPlaceholder);
if(this.inlineEditBox.autoSave){
_1.destroy(this.buttonContainer);
}
},postCreate:function(){
this.inherited(arguments);
var ew=this.editWidget;
if(this.inlineEditBox.autoSave){
this.connect(ew,"onChange","_onChange");
this.connect(ew,"onKeyPress","_onKeyPress");
}else{
if("intermediateChanges" in ew){
ew.set("intermediateChanges",true);
this.connect(ew,"onChange","_onIntermediateChange");
this.saveButton.set("disabled",true);
}
}
},_onIntermediateChange:function(val){
this.saveButton.set("disabled",(this.getValue()==this._resetValue)||!this.enableSave());
},destroy:function(){
this.editWidget.destroy(true);
this.inherited(arguments);
},getValue:function(){
var ew=this.editWidget;
return String(ew.get("displayedValue" in ew?"displayedValue":"value"));
},_onKeyPress:function(e){
if(this.inlineEditBox.autoSave&&this.inlineEditBox.editing){
if(e.altKey||e.ctrlKey){
return;
}
if(e.charOrCode==_1.keys.ESCAPE){
_1.stopEvent(e);
this.cancel(true);
}else{
if(e.charOrCode==_1.keys.ENTER&&e.target.tagName=="INPUT"){
_1.stopEvent(e);
this._onChange();
}
}
}
},_onBlur:function(){
this.inherited(arguments);
if(this.inlineEditBox.autoSave&&this.inlineEditBox.editing){
if(this.getValue()==this._resetValue){
this.cancel(false);
}else{
if(this.enableSave()){
this.save(false);
}
}
}
},_onChange:function(){
if(this.inlineEditBox.autoSave&&this.inlineEditBox.editing&&this.enableSave()){
_2.focus(this.inlineEditBox.displayNode);
}
},enableSave:function(){
return (this.editWidget.isValid?this.editWidget.isValid():true);
},focus:function(){
this.editWidget.focus();
setTimeout(_1.hitch(this,function(){
if(this.editWidget.focusNode&&this.editWidget.focusNode.tagName=="INPUT"){
_2.selectInputText(this.editWidget.focusNode);
}
}),0);
}});
return _2.InlineEditBox;
});
