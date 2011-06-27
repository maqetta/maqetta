/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/Editor",["dojo/_base/kernel",".","./_base/focus","./_editor/RichText","./Toolbar","./ToolbarSeparator","./_editor/_Plugin","./_editor/plugins/EnterKeyHandling","./_editor/range","./_Container","dojo/i18n","./layout/_LayoutWidget","dojo/i18n!./_editor/nls/commands","./form/ToggleButton","dojo/_base/Deferred","dojo/_base/array","dojo/_base/connect","dojo/_base/declare","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/sniff","dojo/_base/window","dojo/string"],function(_1,_2){
_1.declare("dijit.Editor",_2._editor.RichText,{plugins:null,extraPlugins:null,constructor:function(){
if(!_1.isArray(this.plugins)){
this.plugins=["undo","redo","|","cut","copy","paste","|","bold","italic","underline","strikethrough","|","insertOrderedList","insertUnorderedList","indent","outdent","|","justifyLeft","justifyRight","justifyCenter","justifyFull","dijit._editor.plugins.EnterKeyHandling"];
}
this._plugins=[];
this._editInterval=this.editActionInterval*1000;
if(_1.isIE){
this.events.push("onBeforeDeactivate");
this.events.push("onBeforeActivate");
}
},postMixInProperties:function(){
this.setValueDeferred=new _1.Deferred();
this.inherited(arguments);
},postCreate:function(){
this._steps=this._steps.slice(0);
this._undoedSteps=this._undoedSteps.slice(0);
if(_1.isArray(this.extraPlugins)){
this.plugins=this.plugins.concat(this.extraPlugins);
}
this.inherited(arguments);
this.commands=_1.i18n.getLocalization("dijit._editor","commands",this.lang);
if(!this.toolbar){
this.toolbar=new _2.Toolbar({dir:this.dir,lang:this.lang});
this.header.appendChild(this.toolbar.domNode);
}
_1.forEach(this.plugins,this.addPlugin,this);
this.setValueDeferred.callback(true);
_1.addClass(this.iframe.parentNode,"dijitEditorIFrameContainer");
_1.addClass(this.iframe,"dijitEditorIFrame");
_1.attr(this.iframe,"allowTransparency",true);
if(_1.isWebKit){
_1.style(this.domNode,"KhtmlUserSelect","none");
}
this.toolbar.startup();
this.onNormalizedDisplayChanged();
},destroy:function(){
_1.forEach(this._plugins,function(p){
if(p&&p.destroy){
p.destroy();
}
});
this._plugins=[];
this.toolbar.destroyRecursive();
delete this.toolbar;
this.inherited(arguments);
},addPlugin:function(_3,_4){
var _5=_1.isString(_3)?{name:_3}:_3;
if(!_5.setEditor){
var o={"args":_5,"plugin":null,"editor":this};
_1.publish(_2._scopeName+".Editor.getPlugin",[o]);
if(!o.plugin){
var pc=_1.getObject(_5.name);
if(pc){
o.plugin=new pc(_5);
}
}
if(!o.plugin){
console.warn("Cannot find plugin",_3);
return;
}
_3=o.plugin;
}
if(arguments.length>1){
this._plugins[_4]=_3;
}else{
this._plugins.push(_3);
}
_3.setEditor(this);
if(_1.isFunction(_3.setToolbar)){
_3.setToolbar(this.toolbar);
}
},startup:function(){
},resize:function(_6){
if(_6){
_2.layout._LayoutWidget.prototype.resize.apply(this,arguments);
}
},layout:function(){
var _7=(this._contentBox.h-(this.getHeaderHeight()+this.getFooterHeight()+_1._getPadBorderExtents(this.iframe.parentNode).h+_1._getMarginExtents(this.iframe.parentNode).h));
this.editingArea.style.height=_7+"px";
if(this.iframe){
this.iframe.style.height="100%";
}
this._layoutMode=true;
},_onIEMouseDown:function(e){
var _8;
var b=this.document.body;
var _9=b.clientWidth;
var _a=b.clientHeight;
var _b=b.clientLeft;
var _c=b.offsetWidth;
var _d=b.offsetHeight;
var _e=b.offsetLeft;
if(/^rtl$/i.test(b.dir||"")){
if(_9<_c&&e.x>_9&&e.x<_c){
_8=true;
}
}else{
if(e.x<_b&&e.x>_e){
_8=true;
}
}
if(!_8){
if(_a<_d&&e.y>_a&&e.y<_d){
_8=true;
}
}
if(!_8){
delete this._cursorToStart;
delete this._savedSelection;
if(e.target.tagName=="BODY"){
setTimeout(_1.hitch(this,"placeCursorAtEnd"),0);
}
this.inherited(arguments);
}
},onBeforeActivate:function(e){
this._restoreSelection();
},onBeforeDeactivate:function(e){
if(this.customUndo){
this.endEditing(true);
}
if(e.target.tagName!="BODY"){
this._saveSelection();
}
},customUndo:true,editActionInterval:3,beginEditing:function(_f){
if(!this._inEditing){
this._inEditing=true;
this._beginEditing(_f);
}
if(this.editActionInterval>0){
if(this._editTimer){
clearTimeout(this._editTimer);
}
this._editTimer=setTimeout(_1.hitch(this,this.endEditing),this._editInterval);
}
},_steps:[],_undoedSteps:[],execCommand:function(cmd){
if(this.customUndo&&(cmd=="undo"||cmd=="redo")){
return this[cmd]();
}else{
if(this.customUndo){
this.endEditing();
this._beginEditing();
}
var r=this.inherited(arguments);
if(this.customUndo){
this._endEditing();
}
return r;
}
},_pasteImpl:function(){
return this._clipboardCommand("paste");
},_cutImpl:function(){
return this._clipboardCommand("cut");
},_copyImpl:function(){
return this._clipboardCommand("copy");
},_clipboardCommand:function(cmd){
var r;
try{
r=this.document.execCommand(cmd,false,null);
if(_1.isWebKit&&!r){
throw {code:1011};
}
}
catch(e){
if(e.code==1011){
var sub=_1.string.substitute,_10={cut:"X",copy:"C",paste:"V"};
alert(sub(this.commands.systemShortcut,[this.commands[cmd],sub(this.commands[_1.isMac?"appleKey":"ctrlKey"],[_10[cmd]])]));
}
r=false;
}
return r;
},queryCommandEnabled:function(cmd){
if(this.customUndo&&(cmd=="undo"||cmd=="redo")){
return cmd=="undo"?(this._steps.length>1):(this._undoedSteps.length>0);
}else{
return this.inherited(arguments);
}
},_moveToBookmark:function(b){
var _11=b.mark;
var _12=b.mark;
var col=b.isCollapsed;
var r,_13,_14,sel;
if(_12){
if(_1.isIE<9){
if(_1.isArray(_12)){
_11=[];
_1.forEach(_12,function(n){
_11.push(_2.range.getNode(n,this.editNode));
},this);
_1.withGlobal(this.window,"moveToBookmark",_2,[{mark:_11,isCollapsed:col}]);
}else{
if(_12.startContainer&&_12.endContainer){
sel=_2.range.getSelection(this.window);
if(sel&&sel.removeAllRanges){
sel.removeAllRanges();
r=_2.range.create(this.window);
_13=_2.range.getNode(_12.startContainer,this.editNode);
_14=_2.range.getNode(_12.endContainer,this.editNode);
if(_13&&_14){
r.setStart(_13,_12.startOffset);
r.setEnd(_14,_12.endOffset);
sel.addRange(r);
}
}
}
}
}else{
sel=_2.range.getSelection(this.window);
if(sel&&sel.removeAllRanges){
sel.removeAllRanges();
r=_2.range.create(this.window);
_13=_2.range.getNode(_12.startContainer,this.editNode);
_14=_2.range.getNode(_12.endContainer,this.editNode);
if(_13&&_14){
r.setStart(_13,_12.startOffset);
r.setEnd(_14,_12.endOffset);
sel.addRange(r);
}
}
}
}
},_changeToStep:function(_15,to){
this.setValue(to.text);
var b=to.bookmark;
if(!b){
return;
}
this._moveToBookmark(b);
},undo:function(){
var ret=false;
if(!this._undoRedoActive){
this._undoRedoActive=true;
this.endEditing(true);
var s=this._steps.pop();
if(s&&this._steps.length>0){
this.focus();
this._changeToStep(s,this._steps[this._steps.length-1]);
this._undoedSteps.push(s);
this.onDisplayChanged();
delete this._undoRedoActive;
ret=true;
}
delete this._undoRedoActive;
}
return ret;
},redo:function(){
var ret=false;
if(!this._undoRedoActive){
this._undoRedoActive=true;
this.endEditing(true);
var s=this._undoedSteps.pop();
if(s&&this._steps.length>0){
this.focus();
this._changeToStep(this._steps[this._steps.length-1],s);
this._steps.push(s);
this.onDisplayChanged();
ret=true;
}
delete this._undoRedoActive;
}
return ret;
},endEditing:function(_16){
if(this._editTimer){
clearTimeout(this._editTimer);
}
if(this._inEditing){
this._endEditing(_16);
this._inEditing=false;
}
},_getBookmark:function(){
var b=_1.withGlobal(this.window,_2.getBookmark);
var tmp=[];
if(b&&b.mark){
var _17=b.mark;
if(_1.isIE<9){
var sel=_2.range.getSelection(this.window);
if(!_1.isArray(_17)){
if(sel){
var _18;
if(sel.rangeCount){
_18=sel.getRangeAt(0);
}
if(_18){
b.mark=_18.cloneRange();
}else{
b.mark=_1.withGlobal(this.window,_2.getBookmark);
}
}
}else{
_1.forEach(b.mark,function(n){
tmp.push(_2.range.getIndex(n,this.editNode).o);
},this);
b.mark=tmp;
}
}
try{
if(b.mark&&b.mark.startContainer){
tmp=_2.range.getIndex(b.mark.startContainer,this.editNode).o;
b.mark={startContainer:tmp,startOffset:b.mark.startOffset,endContainer:b.mark.endContainer===b.mark.startContainer?tmp:_2.range.getIndex(b.mark.endContainer,this.editNode).o,endOffset:b.mark.endOffset};
}
}
catch(e){
b.mark=null;
}
}
return b;
},_beginEditing:function(cmd){
if(this._steps.length===0){
this._steps.push({"text":_2._editor.getChildrenHtml(this.editNode),"bookmark":this._getBookmark()});
}
},_endEditing:function(_19){
var v=_2._editor.getChildrenHtml(this.editNode);
this._undoedSteps=[];
this._steps.push({text:v,bookmark:this._getBookmark()});
},onKeyDown:function(e){
if(!_1.isIE&&!this.iframe&&e.keyCode==_1.keys.TAB&&!this.tabIndent){
this._saveSelection();
}
if(!this.customUndo){
this.inherited(arguments);
return;
}
var k=e.keyCode,ks=_1.keys;
if(e.ctrlKey&&!e.altKey){
if(k==90||k==122){
_1.stopEvent(e);
this.undo();
return;
}else{
if(k==89||k==121){
_1.stopEvent(e);
this.redo();
return;
}
}
}
this.inherited(arguments);
switch(k){
case ks.ENTER:
case ks.BACKSPACE:
case ks.DELETE:
this.beginEditing();
break;
case 88:
case 86:
if(e.ctrlKey&&!e.altKey&&!e.metaKey){
this.endEditing();
if(e.keyCode==88){
this.beginEditing("cut");
setTimeout(_1.hitch(this,this.endEditing),1);
}else{
this.beginEditing("paste");
setTimeout(_1.hitch(this,this.endEditing),1);
}
break;
}
default:
if(!e.ctrlKey&&!e.altKey&&!e.metaKey&&(e.keyCode<_1.keys.F1||e.keyCode>_1.keys.F15)){
this.beginEditing();
break;
}
case ks.ALT:
this.endEditing();
break;
case ks.UP_ARROW:
case ks.DOWN_ARROW:
case ks.LEFT_ARROW:
case ks.RIGHT_ARROW:
case ks.HOME:
case ks.END:
case ks.PAGE_UP:
case ks.PAGE_DOWN:
this.endEditing(true);
break;
case ks.CTRL:
case ks.SHIFT:
case ks.TAB:
break;
}
},_onBlur:function(){
this.inherited(arguments);
this.endEditing(true);
},_saveSelection:function(){
try{
this._savedSelection=this._getBookmark();
}
catch(e){
}
},_restoreSelection:function(){
if(this._savedSelection){
delete this._cursorToStart;
if(_1.withGlobal(this.window,"isCollapsed",_2)){
this._moveToBookmark(this._savedSelection);
}
delete this._savedSelection;
}
},onClick:function(){
this.endEditing(true);
this.inherited(arguments);
},replaceValue:function(_1a){
if(!this.customUndo){
this.inherited(arguments);
}else{
if(this.isClosed){
this.setValue(_1a);
}else{
this.beginEditing();
if(!_1a){
_1a="&nbsp;";
}
this.setValue(_1a);
this.endEditing();
}
}
},_setDisabledAttr:function(_1b){
var _1c=_1.hitch(this,function(){
if((!this.disabled&&_1b)||(!this._buttonEnabledPlugins&&_1b)){
_1.forEach(this._plugins,function(p){
p.set("disabled",true);
});
}else{
if(this.disabled&&!_1b){
_1.forEach(this._plugins,function(p){
p.set("disabled",false);
});
}
}
});
this.setValueDeferred.addCallback(_1c);
this.inherited(arguments);
},_setStateClass:function(){
try{
this.inherited(arguments);
if(this.document&&this.document.body){
_1.style(this.document.body,"color",_1.style(this.iframe,"color"));
}
}
catch(e){
}
}});
_1.subscribe(_2._scopeName+".Editor.getPlugin",null,function(o){
if(o.plugin){
return;
}
var _1d=o.args,p;
var _1e=_2._editor._Plugin;
var _1f=_1d.name;
switch(_1f){
case "undo":
case "redo":
case "cut":
case "copy":
case "paste":
case "insertOrderedList":
case "insertUnorderedList":
case "indent":
case "outdent":
case "justifyCenter":
case "justifyFull":
case "justifyLeft":
case "justifyRight":
case "delete":
case "selectAll":
case "removeFormat":
case "unlink":
case "insertHorizontalRule":
p=new _1e({command:_1f});
break;
case "bold":
case "italic":
case "underline":
case "strikethrough":
case "subscript":
case "superscript":
p=new _1e({buttonClass:_2.form.ToggleButton,command:_1f});
break;
case "|":
p=new _1e({button:new _2.ToolbarSeparator(),setEditor:function(_20){
this.editor=_20;
}});
}
o.plugin=p;
});
return _2.Editor;
});
