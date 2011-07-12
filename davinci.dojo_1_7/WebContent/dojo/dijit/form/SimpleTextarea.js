/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/form/SimpleTextarea",["dojo/_base/kernel","..","./TextBox","dojo/_base/html","dojo/_base/sniff","dojo/_base/window"],function(_1,_2){
_1.declare("dijit.form.SimpleTextarea",_2.form.TextBox,{baseClass:"dijitTextBox dijitTextArea",rows:"3",cols:"20",templateString:"<textarea ${!nameAttrSetting} dojoAttachPoint='focusNode,containerNode,textbox' autocomplete='off'></textarea>",postMixInProperties:function(){
if(!this.value&&this.srcNodeRef){
this.value=this.srcNodeRef.value;
}
this.inherited(arguments);
},buildRendering:function(){
this.inherited(arguments);
if(_1.isIE&&this.cols){
_1.addClass(this.textbox,"dijitTextAreaCols");
}
},filter:function(_3){
if(_3){
_3=_3.replace(/\r/g,"");
}
return this.inherited(arguments);
},_onInput:function(e){
if(this.maxLength){
var _4=parseInt(this.maxLength);
var _5=this.textbox.value.replace(/\r/g,"");
var _6=_5.length-_4;
if(_6>0){
var _7=this.textbox;
if(_7.selectionStart){
var _8=_7.selectionStart;
var cr=0;
if(_1.isOpera){
cr=(this.textbox.value.substring(0,_8).match(/\r/g)||[]).length;
}
this.textbox.value=_5.substring(0,_8-_6-cr)+_5.substring(_8-cr);
_7.setSelectionRange(_8-_6,_8-_6);
}else{
if(_1.doc.selection){
_7.focus();
var _9=_1.doc.selection.createRange();
_9.moveStart("character",-_6);
_9.text="";
_9.select();
}
}
}
}
this.inherited(arguments);
}});
return _2.form.SimpleTextarea;
});
