/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/form/FilePickerTextBox",["dojo","dijit","dojox","dojo/window","dijit/form/ValidationTextBox","dijit/_HasDropDown","dijit/_base/focus","dojox/widget/FilePicker"],function(_1,_2,_3){
_1.getObject("dojox.form.FilePickerTextBox",1);
_1.declare("dojox.form.FilePickerTextBox",[_2.form.ValidationTextBox,_2._HasDropDown],{baseClass:"dojoxFilePickerTextBox",templateString:_1.cache("dojox.form","resources/FilePickerTextBox.html","<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\trole=\"combobox\" tabIndex=\"-1\"\n\t><div style=\"overflow:hidden;\"\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"downArrowNode,_buttonNode,_popupStateNode\" role=\"presentation\"\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\n\t\t></div\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\n\t\t><div class=\"dijitReset dijitInputField\"\n\t\t\t><input type=\"text\" autocomplete=\"off\" ${!nameAttrSetting} class='dijitReset'\n\t\t\t\tdojoAttachEvent='onkeypress:_onKey' \n\t\t\t\tdojoAttachPoint='textbox,focusNode' role=\"textbox\" aria-haspopup=\"true\" aria-autocomplete=\"list\"\n\t\t/></div\n\t></div\n></div>\n"),searchDelay:500,valueItem:null,numPanes:2.25,postMixInProperties:function(){
this.inherited(arguments);
this.dropDown=new _3.widget.FilePicker(this.constraints);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.dropDown,"onChange",this._onWidgetChange);
this.connect(this.focusNode,"onblur","_focusBlur");
this.connect(this.focusNode,"onfocus","_focusFocus");
this.connect(this.focusNode,"ondblclick",function(){
_2.selectInputText(this.focusNode);
});
},_setValueAttr:function(_4,_5,_6){
if(!this._searchInProgress){
this.inherited(arguments);
_4=_4||"";
var _7=this.dropDown.get("pathValue")||"";
if(_4!==_7){
this._skip=true;
var fx=_1.hitch(this,"_setBlurValue");
this.dropDown._setPathValueAttr(_4,!_6,this._settingBlurValue?fx:null);
}
}
},_onWidgetChange:function(_8){
if(!_8&&this.focusNode.value){
this._hasValidPath=false;
this.focusNode.value="";
}else{
this.valueItem=_8;
var _9=this.dropDown._getPathValueAttr(_8);
if(_9){
this._hasValidPath=true;
}
if(!this._skip){
this._setValueAttr(_9,undefined,true);
}
delete this._skip;
}
this.validate();
},startup:function(){
if(!this.dropDown._started){
this.dropDown.startup();
}
this.inherited(arguments);
},openDropDown:function(){
this.dropDown.domNode.style.width="0px";
if(!("minPaneWidth" in (this.constraints||{}))){
this.dropDown.set("minPaneWidth",(this.domNode.offsetWidth/this.numPanes));
}
this.inherited(arguments);
},toggleDropDown:function(){
this.inherited(arguments);
if(this._opened){
this.dropDown.set("pathValue",this.get("value"));
}
},_focusBlur:function(e){
if(e.explicitOriginalTarget==this.focusNode&&!this._allowBlur){
window.setTimeout(_1.hitch(this,function(){
if(!this._allowBlur){
this.focus();
}
}),1);
}else{
if(this._menuFocus){
this.dropDown._updateClass(this._menuFocus,"Item",{"Hover":false});
delete this._menuFocus;
}
}
},_focusFocus:function(e){
if(this._menuFocus){
this.dropDown._updateClass(this._menuFocus,"Item",{"Hover":false});
}
delete this._menuFocus;
var _a=_2.getFocus(this);
if(_a&&_a.node){
_a=_2.byNode(_a.node);
if(_a){
this._menuFocus=_a.domNode;
}
}
if(this._menuFocus){
this.dropDown._updateClass(this._menuFocus,"Item",{"Hover":true});
}
delete this._allowBlur;
},_onBlur:function(){
this._allowBlur=true;
delete this.dropDown._savedFocus;
this.inherited(arguments);
},_setBlurValue:function(){
if(this.dropDown&&!this._settingBlurValue){
this._settingBlurValue=true;
this.set("value",this.focusNode.value);
}else{
delete this._settingBlurValue;
this.inherited(arguments);
}
},parse:function(_b,_c){
if(this._hasValidPath||this._hasSelection){
return _b;
}
var dd=this.dropDown,_d=dd.topDir,_e=dd.pathSeparator;
var _f=dd.get("pathValue");
var _10=function(v){
if(_d.length&&v.indexOf(_d)===0){
v=v.substring(_d.length);
}
if(_e&&v[v.length-1]==_e){
v=v.substring(0,v.length-1);
}
return v;
};
_f=_10(_f);
var val=_10(_b);
if(val==_f){
return _b;
}
return undefined;
},_startSearchFromInput:function(){
var dd=this.dropDown,fn=this.focusNode;
var val=fn.value,_11=val,_12=dd.topDir;
if(this._hasSelection){
_2.selectInputText(fn,_11.length);
}
this._hasSelection=false;
if(_12.length&&val.indexOf(_12)===0){
val=val.substring(_12.length);
}
var _13=val.split(dd.pathSeparator);
var _14=_1.hitch(this,function(idx){
var dir=_13[idx];
var _15=dd.getChildren()[idx];
var _16;
this._searchInProgress=true;
var _17=_1.hitch(this,function(){
delete this._searchInProgress;
});
if((dir||_15)&&!this._opened){
this.toggleDropDown();
}
if(dir&&_15){
var fx=_1.hitch(this,function(){
if(_16){
this.disconnect(_16);
}
delete _16;
var _18=_15._menu.getChildren();
var _19=_1.filter(_18,function(i){
return i.label==dir;
})[0];
var _1a=_1.filter(_18,function(i){
return (i.label.indexOf(dir)===0);
})[0];
if(_19&&((_13.length>idx+1&&_19.children)||(!_19.children))){
idx++;
_15._menu.onItemClick(_19,{type:"internal",stopPropagation:function(){
},preventDefault:function(){
}});
if(_13[idx]){
_14(idx);
}else{
_17();
}
}else{
_15._setSelected(null);
if(_1a&&_13.length===idx+1){
dd._setInProgress=true;
dd._removeAfter(_15);
delete dd._setInProgress;
var _1b=_1a.label;
if(_1a.children){
_1b+=dd.pathSeparator;
}
_1b=_1b.substring(dir.length);
window.setTimeout(function(){
_1.window.scrollIntoView(_1a.domNode);
},1);
fn.value=_11+_1b;
_2.selectInputText(fn,_11.length);
this._hasSelection=true;
try{
_1a.focusNode.focus();
}
catch(e){
}
}else{
if(this._menuFocus){
this.dropDown._updateClass(this._menuFocus,"Item",{"Hover":false,"Focus":false});
}
delete this._menuFocus;
}
_17();
}
});
if(!_15.isLoaded){
_16=this.connect(_15,"onLoad",fx);
}else{
fx();
}
}else{
if(_15){
_15._setSelected(null);
dd._setInProgress=true;
dd._removeAfter(_15);
delete dd._setInProgress;
}
_17();
}
});
_14(0);
},_onKey:function(e){
if(this.disabled||this.readOnly){
return;
}
var dk=_1.keys;
var c=e.charOrCode;
if(c==dk.DOWN_ARROW){
this._allowBlur=true;
}
if(c==dk.ENTER&&this._opened){
this.dropDown.onExecute();
_2.selectInputText(this.focusNode,this.focusNode.value.length);
this._hasSelection=false;
_1.stopEvent(e);
return;
}
if((c==dk.RIGHT_ARROW||c==dk.LEFT_ARROW||c==dk.TAB)&&this._hasSelection){
this._startSearchFromInput();
_1.stopEvent(e);
return;
}
this.inherited(arguments);
var _1c=false;
if((c==dk.BACKSPACE||c==dk.DELETE)&&this._hasSelection){
this._hasSelection=false;
}else{
if(c==dk.BACKSPACE||c==dk.DELETE||c==" "){
_1c=true;
}else{
_1c=e.keyChar!=="";
}
}
if(this._searchTimer){
window.clearTimeout(this._searchTimer);
}
delete this._searchTimer;
if(_1c){
this._hasValidPath=false;
this._hasSelection=false;
this._searchTimer=window.setTimeout(_1.hitch(this,"_startSearchFromInput"),this.searchDelay+1);
}
}});
return _1.getObject("dojox.form.FilePickerTextBox");
});
require(["dojox/form/FilePickerTextBox"]);
