/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/_editor/plugins/FontChoice",["dojo/_base/kernel","../..","../../_Widget","../../_TemplatedMixin","../../_WidgetsInTemplateMixin","../_Plugin","../range","../selection","../../form/FilteringSelect","dojo/store/Memory","dojo/i18n","dojo/i18n!../nls/FontChoice","dojo/_base/array","dojo/_base/html","dojo/_base/lang","dojo/_base/window"],function(_1,_2){
_1.declare("dijit._editor.plugins._FontDropDown",[_2._Widget,_2._TemplatedMixin,_2._WidgetsInTemplateMixin],{label:"",plainText:false,templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline'>"+"<label class='dijitLeft dijitInline' for='${selectId}'>${label}</label>"+"<input dojoType='dijit.form.FilteringSelect' required='false' labelType='html' labelAttr='label' searchAttr='name' "+"tabIndex='-1' id='${selectId}' dojoAttachPoint='select' value=''/>"+"</span>",postMixInProperties:function(){
this.inherited(arguments);
this.strings=_1.i18n.getLocalization("dijit._editor","FontChoice");
this.label=this.strings[this.command];
this.id=_2.getUniqueId(this.declaredClass.replace(/\./g,"_"));
this.selectId=this.id+"_select";
this.inherited(arguments);
},postCreate:function(){
this.select.set("store",new _1.store.Memory({idProperty:"value",data:_1.map(this.values,function(_3){
var _4=this.strings[_3]||_3;
return {label:this.getLabel(_3,_4),name:_4,value:_3};
},this)}));
this.select.set("value","",false);
this.disabled=this.select.get("disabled");
},_setValueAttr:function(_5,_6){
_6=_6!==false;
this.select.set("value",_1.indexOf(this.values,_5)<0?"":_5,_6);
if(!_6){
this.select._lastValueReported=null;
}
},_getValueAttr:function(){
return this.select.get("value");
},focus:function(){
this.select.focus();
},_setDisabledAttr:function(_7){
this.disabled=_7;
this.select.set("disabled",_7);
}});
_1.declare("dijit._editor.plugins._FontNameDropDown",_2._editor.plugins._FontDropDown,{generic:false,command:"fontName",postMixInProperties:function(){
if(!this.values){
this.values=this.generic?["serif","sans-serif","monospace","cursive","fantasy"]:["Arial","Times New Roman","Comic Sans MS","Courier New"];
}
this.inherited(arguments);
},getLabel:function(_8,_9){
if(this.plainText){
return _9;
}else{
return "<div style='font-family: "+_8+"'>"+_9+"</div>";
}
},_setValueAttr:function(_a,_b){
_b=_b!==false;
if(this.generic){
var _c={"Arial":"sans-serif","Helvetica":"sans-serif","Myriad":"sans-serif","Times":"serif","Times New Roman":"serif","Comic Sans MS":"cursive","Apple Chancery":"cursive","Courier":"monospace","Courier New":"monospace","Papyrus":"fantasy"};
_a=_c[_a]||_a;
}
this.inherited(arguments,[_a,_b]);
}});
_1.declare("dijit._editor.plugins._FontSizeDropDown",_2._editor.plugins._FontDropDown,{command:"fontSize",values:[1,2,3,4,5,6,7],getLabel:function(_d,_e){
if(this.plainText){
return _e;
}else{
return "<font size="+_d+"'>"+_e+"</font>";
}
},_setValueAttr:function(_f,_10){
_10=_10!==false;
if(_f.indexOf&&_f.indexOf("px")!=-1){
var _11=parseInt(_f,10);
_f={10:1,13:2,16:3,18:4,24:5,32:6,48:7}[_11]||_f;
}
this.inherited(arguments,[_f,_10]);
}});
_1.declare("dijit._editor.plugins._FormatBlockDropDown",_2._editor.plugins._FontDropDown,{command:"formatBlock",values:["noFormat","p","h1","h2","h3","pre"],postCreate:function(){
this.inherited(arguments);
this.set("value","noFormat",false);
},getLabel:function(_12,_13){
if(this.plainText||_12=="noFormat"){
return _13;
}else{
return "<"+_12+">"+_13+"</"+_12+">";
}
},_execCommand:function(_14,_15,_16){
if(_16==="noFormat"){
var _17;
var end;
var sel=_2.range.getSelection(_14.window);
if(sel&&sel.rangeCount>0){
var _18=sel.getRangeAt(0);
var _19,tag;
if(_18){
_17=_18.startContainer;
end=_18.endContainer;
while(_17&&_17!==_14.editNode&&_17!==_14.document.body&&_17.nodeType!==1){
_17=_17.parentNode;
}
while(end&&end!==_14.editNode&&end!==_14.document.body&&end.nodeType!==1){
end=end.parentNode;
}
var _1a=_1.hitch(this,function(_1b,_1c){
if(_1b.childNodes&&_1b.childNodes.length){
var i;
for(i=0;i<_1b.childNodes.length;i++){
var c=_1b.childNodes[i];
if(c.nodeType==1){
if(_1.withGlobal(_14.window,"inSelection",_2._editor.selection,[c])){
var tag=c.tagName?c.tagName.toLowerCase():"";
if(_1.indexOf(this.values,tag)!==-1){
_1c.push(c);
}
_1a(c,_1c);
}
}
}
}
});
var _1d=_1.hitch(this,function(_1e){
if(_1e&&_1e.length){
_14.beginEditing();
while(_1e.length){
this._removeFormat(_14,_1e.pop());
}
_14.endEditing();
}
});
var _1f=[];
if(_17==end){
var _20;
_19=_17;
while(_19&&_19!==_14.editNode&&_19!==_14.document.body){
if(_19.nodeType==1){
tag=_19.tagName?_19.tagName.toLowerCase():"";
if(_1.indexOf(this.values,tag)!==-1){
_20=_19;
break;
}
}
_19=_19.parentNode;
}
_1a(_17,_1f);
if(_20){
_1f=[_20].concat(_1f);
}
_1d(_1f);
}else{
_19=_17;
while(_1.withGlobal(_14.window,"inSelection",_2._editor.selection,[_19])){
if(_19.nodeType==1){
tag=_19.tagName?_19.tagName.toLowerCase():"";
if(_1.indexOf(this.values,tag)!==-1){
_1f.push(_19);
}
_1a(_19,_1f);
}
_19=_19.nextSibling;
}
_1d(_1f);
}
_14.onDisplayChanged();
}
}
}else{
_14.execCommand(_15,_16);
}
},_removeFormat:function(_21,_22){
if(_21.customUndo){
while(_22.firstChild){
_1.place(_22.firstChild,_22,"before");
}
_22.parentNode.removeChild(_22);
}else{
_1.withGlobal(_21.window,"selectElementChildren",_2._editor.selection,[_22]);
var _23=_1.withGlobal(_21.window,"getSelectedHtml",_2._editor.selection,[null]);
_1.withGlobal(_21.window,"selectElement",_2._editor.selection,[_22]);
_21.execCommand("inserthtml",_23||"");
}
}});
_1.declare("dijit._editor.plugins.FontChoice",_2._editor._Plugin,{useDefaultCommand:false,_initButton:function(){
var _24={fontName:_2._editor.plugins._FontNameDropDown,fontSize:_2._editor.plugins._FontSizeDropDown,formatBlock:_2._editor.plugins._FormatBlockDropDown}[this.command],_25=this.params;
if(this.params.custom){
_25.values=this.params.custom;
}
var _26=this.editor;
this.button=new _24(_1.delegate({dir:_26.dir,lang:_26.lang},_25));
this.connect(this.button.select,"onChange",function(_27){
this.editor.focus();
if(this.command=="fontName"&&_27.indexOf(" ")!=-1){
_27="'"+_27+"'";
}
if(this.button._execCommand){
this.button._execCommand(this.editor,this.command,_27);
}else{
this.editor.execCommand(this.command,_27);
}
});
},updateState:function(){
var _28=this.editor;
var _29=this.command;
if(!_28||!_28.isLoaded||!_29.length){
return;
}
if(this.button){
var _2a=this.get("disabled");
this.button.set("disabled",_2a);
if(_2a){
return;
}
var _2b;
try{
_2b=_28.queryCommandValue(_29)||"";
}
catch(e){
_2b="";
}
var _2c=_1.isString(_2b)&&_2b.match(/'([^']*)'/);
if(_2c){
_2b=_2c[1];
}
if(_29==="formatBlock"){
if(!_2b||_2b=="p"){
_2b=null;
var _2d;
var sel=_2.range.getSelection(this.editor.window);
if(sel&&sel.rangeCount>0){
var _2e=sel.getRangeAt(0);
if(_2e){
_2d=_2e.endContainer;
}
}
while(_2d&&_2d!==_28.editNode&&_2d!==_28.document){
var tg=_2d.tagName?_2d.tagName.toLowerCase():"";
if(tg&&_1.indexOf(this.button.values,tg)>-1){
_2b=tg;
break;
}
_2d=_2d.parentNode;
}
if(!_2b){
_2b="noFormat";
}
}else{
if(_1.indexOf(this.button.values,_2b)<0){
_2b="noFormat";
}
}
}
if(_2b!==this.button.get("value")){
this.button.set("value",_2b,false);
}
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
switch(o.args.name){
case "fontName":
case "fontSize":
case "formatBlock":
o.plugin=new _2._editor.plugins.FontChoice({command:o.args.name,plainText:o.args.plainText?o.args.plainText:false});
}
});
return _2._editor.plugins.FontChoice;
});
