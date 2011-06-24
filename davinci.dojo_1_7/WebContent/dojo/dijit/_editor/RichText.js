/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define("dijit/_editor/RichText",["dojo/_base/kernel","..","../_Widget","../_CssStateMixin","./selection","./range","./html","../focus","dojo/_base/Deferred","dojo/_base/NodeList","dojo/_base/array","dojo/_base/connect","dojo/_base/event","dojo/_base/html","dojo/_base/lang","dojo/_base/url","dojo/ready","dojo/_base/sniff","dojo/_base/unload","dojo/_base/window","dojo/query"],function(_1,_2){
_1.declare("dijit._editor.RichText",[_2._Widget,_2._CssStateMixin],{constructor:function(_3){
this.contentPreFilters=[];
this.contentPostFilters=[];
this.contentDomPreFilters=[];
this.contentDomPostFilters=[];
this.editingAreaStyleSheets=[];
this.events=[].concat(this.events);
this._keyHandlers={};
if(_3&&_1.isString(_3.value)){
this.value=_3.value;
}
this.onLoadDeferred=new _1.Deferred();
},baseClass:"dijitEditor",inheritWidth:false,focusOnLoad:false,name:"",styleSheets:"",height:"300px",minHeight:"1em",isClosed:true,isLoaded:false,_SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@",_NAME_CONTENT_SEP:"@@**%%:%%**@@",onLoadDeferred:null,isTabIndent:false,disableSpellCheck:false,postCreate:function(){
if("textarea"===this.domNode.tagName.toLowerCase()){
console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
}
this.contentPreFilters=[_1.hitch(this,"_preFixUrlAttributes")].concat(this.contentPreFilters);
if(_1.isMoz){
this.contentPreFilters=[this._normalizeFontStyle].concat(this.contentPreFilters);
this.contentPostFilters=[this._removeMozBogus].concat(this.contentPostFilters);
}
if(_1.isWebKit){
this.contentPreFilters=[this._removeWebkitBogus].concat(this.contentPreFilters);
this.contentPostFilters=[this._removeWebkitBogus].concat(this.contentPostFilters);
}
if(_1.isIE){
this.contentPostFilters=[this._normalizeFontStyle].concat(this.contentPostFilters);
this.contentDomPostFilters=[_1.hitch(this,this._stripBreakerNodes)].concat(this.contentDomPostFilters);
}
this.inherited(arguments);
_1.publish(_2._scopeName+"._editor.RichText::init",[this]);
this.open();
this.setupDefaultShortcuts();
},setupDefaultShortcuts:function(){
var _4=_1.hitch(this,function(_5,_6){
return function(){
return !this.execCommand(_5,_6);
};
});
var _7={b:_4("bold"),i:_4("italic"),u:_4("underline"),a:_4("selectall"),s:function(){
this.save(true);
},m:function(){
this.isTabIndent=!this.isTabIndent;
},"1":_4("formatblock","h1"),"2":_4("formatblock","h2"),"3":_4("formatblock","h3"),"4":_4("formatblock","h4"),"\\":_4("insertunorderedlist")};
if(!_1.isIE){
_7.Z=_4("redo");
}
var _8;
for(_8 in _7){
this.addKeyHandler(_8,true,false,_7[_8]);
}
},events:["onKeyPress","onKeyDown","onKeyUp"],captureEvents:[],_editorCommandsLocalized:false,_localizeEditorCommands:function(){
if(_2._editor._editorCommandsLocalized){
this._local2NativeFormatNames=_2._editor._local2NativeFormatNames;
this._native2LocalFormatNames=_2._editor._native2LocalFormatNames;
return;
}
_2._editor._editorCommandsLocalized=true;
_2._editor._local2NativeFormatNames={};
_2._editor._native2LocalFormatNames={};
this._local2NativeFormatNames=_2._editor._local2NativeFormatNames;
this._native2LocalFormatNames=_2._editor._native2LocalFormatNames;
var _9=["div","p","pre","h1","h2","h3","h4","h5","h6","ol","ul","address"];
var _a="",_b,i=0;
while((_b=_9[i++])){
if(_b.charAt(1)!=="l"){
_a+="<"+_b+"><span>content</span></"+_b+"><br/>";
}else{
_a+="<"+_b+"><li>content</li></"+_b+"><br/>";
}
}
var _c={position:"absolute",top:"0px",zIndex:10,opacity:0.01};
var _d=_1.create("div",{style:_c,innerHTML:_a});
_1.body().appendChild(_d);
var _e=_1.hitch(this,function(){
var _f=_d.firstChild;
while(_f){
try{
_2._editor.selection.selectElement(_f.firstChild);
var _10=_f.tagName.toLowerCase();
this._local2NativeFormatNames[_10]=document.queryCommandValue("formatblock");
this._native2LocalFormatNames[this._local2NativeFormatNames[_10]]=_10;
_f=_f.nextSibling.nextSibling;
}
catch(e){
}
}
_d.parentNode.removeChild(_d);
_d.innerHTML="";
});
setTimeout(_e,0);
},open:function(_11){
if(!this.onLoadDeferred||this.onLoadDeferred.fired>=0){
this.onLoadDeferred=new _1.Deferred();
}
if(!this.isClosed){
this.close();
}
_1.publish(_2._scopeName+"._editor.RichText::open",[this]);
if(arguments.length===1&&_11.nodeName){
this.domNode=_11;
}
var dn=this.domNode;
var _12;
if(_1.isString(this.value)){
_12=this.value;
delete this.value;
dn.innerHTML="";
}else{
if(dn.nodeName&&dn.nodeName.toLowerCase()=="textarea"){
var ta=(this.textarea=dn);
this.name=ta.name;
_12=ta.value;
dn=this.domNode=_1.doc.createElement("div");
dn.setAttribute("widgetId",this.id);
ta.removeAttribute("widgetId");
dn.cssText=ta.cssText;
dn.className+=" "+ta.className;
_1.place(dn,ta,"before");
var _13=_1.hitch(this,function(){
_1.style(ta,{display:"block",position:"absolute",top:"-1000px"});
if(_1.isIE){
var s=ta.style;
this.__overflow=s.overflow;
s.overflow="hidden";
}
});
if(_1.isIE){
setTimeout(_13,10);
}else{
_13();
}
if(ta.form){
var _14=ta.value;
this.reset=function(){
var _15=this.getValue();
if(_15!==_14){
this.replaceValue(_14);
}
};
_1.connect(ta.form,"onsubmit",this,function(){
_1.attr(ta,"disabled",this.disabled);
ta.value=this.getValue();
});
}
}else{
_12=_2._editor.getChildrenHtml(dn);
dn.innerHTML="";
}
}
var _16=_1.contentBox(dn);
this._oldHeight=_16.h;
this._oldWidth=_16.w;
this.value=_12;
if(dn.nodeName&&dn.nodeName==="LI"){
dn.innerHTML=" <br>";
}
this.header=dn.ownerDocument.createElement("div");
dn.appendChild(this.header);
this.editingArea=dn.ownerDocument.createElement("div");
dn.appendChild(this.editingArea);
this.footer=dn.ownerDocument.createElement("div");
dn.appendChild(this.footer);
if(!this.name){
this.name=this.id+"_AUTOGEN";
}
if(this.name!==""&&(!_1.config["useXDomain"]||_1.config["allowXdRichTextSave"])){
var _17=_1.byId(_2._scopeName+"._editor.RichText.value");
if(_17&&_17.value!==""){
var _18=_17.value.split(this._SEPARATOR),i=0,dat;
while((dat=_18[i++])){
var _19=dat.split(this._NAME_CONTENT_SEP);
if(_19[0]===this.name){
_12=_19[1];
_18=_18.splice(i,1);
_17.value=_18.join(this._SEPARATOR);
break;
}
}
}
if(!_2._editor._globalSaveHandler){
_2._editor._globalSaveHandler={};
_1.addOnUnload(function(){
var id;
for(id in _2._editor._globalSaveHandler){
var f=_2._editor._globalSaveHandler[id];
if(_1.isFunction(f)){
f();
}
}
});
}
_2._editor._globalSaveHandler[this.id]=_1.hitch(this,"_saveContent");
}
this.isClosed=false;
var ifr=(this.editorObject=this.iframe=_1.doc.createElement("iframe"));
ifr.id=this.id+"_iframe";
this._iframeSrc=this._getIframeDocTxt();
ifr.style.border="none";
ifr.style.width="100%";
if(this._layoutMode){
ifr.style.height="100%";
}else{
if(_1.isIE>=7){
if(this.height){
ifr.style.height=this.height;
}
if(this.minHeight){
ifr.style.minHeight=this.minHeight;
}
}else{
ifr.style.height=this.height?this.height:this.minHeight;
}
}
ifr.frameBorder=0;
ifr._loadFunc=_1.hitch(this,function(win){
this.window=win;
this.document=this.window.document;
if(_1.isIE){
this._localizeEditorCommands();
}
this.onLoad(_12);
});
var _1a="parent."+_2._scopeName+".byId(\""+this.id+"\")._iframeSrc";
var s="javascript:(function(){try{return "+_1a+"}catch(e){document.open();document.domain=\""+document.domain+"\";document.write("+_1a+");document.close();}})()";
ifr.setAttribute("src",s);
this.editingArea.appendChild(ifr);
if(_1.isSafari<=4){
var src=ifr.getAttribute("src");
if(!src||src.indexOf("javascript")===-1){
setTimeout(function(){
ifr.setAttribute("src",s);
},0);
}
}
if(dn.nodeName==="LI"){
dn.lastChild.style.marginTop="-1.2em";
}
_1.addClass(this.domNode,this.baseClass);
},_local2NativeFormatNames:{},_native2LocalFormatNames:{},_getIframeDocTxt:function(){
var _1b=_1.getComputedStyle(this.domNode);
var _1c="";
var _1d=true;
if(_1.isIE||_1.isWebKit||(!this.height&&!_1.isMoz)){
_1c="<div id='dijitEditorBody'></div>";
_1d=false;
}else{
if(_1.isMoz){
this._cursorToStart=true;
_1c="&nbsp;";
}
}
var _1e=[_1b.fontWeight,_1b.fontSize,_1b.fontFamily].join(" ");
var _1f=_1b.lineHeight;
if(_1f.indexOf("px")>=0){
_1f=parseFloat(_1f)/parseFloat(_1b.fontSize);
}else{
if(_1f.indexOf("em")>=0){
_1f=parseFloat(_1f);
}else{
_1f="normal";
}
}
var _20="";
var _21=this;
this.style.replace(/(^|;)\s*(line-|font-?)[^;]+/ig,function(_22){
_22=_22.replace(/^;/ig,"")+";";
var s=_22.split(":")[0];
if(s){
s=_1.trim(s);
s=s.toLowerCase();
var i;
var sC="";
for(i=0;i<s.length;i++){
var c=s.charAt(i);
switch(c){
case "-":
i++;
c=s.charAt(i).toUpperCase();
default:
sC+=c;
}
}
_1.style(_21.domNode,sC,"");
}
_20+=_22+";";
});
var _23=_1.query("label[for=\""+this.id+"\"]");
return [this.isLeftToRight()?"<html>\n<head>\n":"<html dir='rtl'>\n<head>\n",(_1.isMoz&&_23.length?"<title>"+_23[0].innerHTML+"</title>\n":""),"<meta http-equiv='Content-Type' content='text/html'>\n","<style>\n","\tbody,html {\n","\t\tbackground:transparent;\n","\t\tpadding: 1px 0 0 0;\n","\t\tmargin: -1px 0 0 0;\n",((_1.isWebKit)?"\t\twidth: 100%;\n":""),((_1.isWebKit)?"\t\theight: 100%;\n":""),"\t}\n","\tbody{\n","\t\ttop:0px;\n","\t\tleft:0px;\n","\t\tright:0px;\n","\t\tfont:",_1e,";\n",((this.height||_1.isOpera)?"":"\t\tposition: fixed;\n"),"\t\tmin-height:",this.minHeight,";\n","\t\tline-height:",_1f,";\n","\t}\n","\tp{ margin: 1em 0; }\n",(!_1d&&!this.height?"\tbody,html {overflow-y: hidden;}\n":""),"\t#dijitEditorBody{overflow-x: auto; overflow-y:"+(this.height?"auto;":"hidden;")+" outline: 0px;}\n","\tli > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; }\n",(!_1.isIE?"\tli{ min-height:1.2em; }\n":""),"</style>\n",this._applyEditingAreaStyleSheets(),"\n","</head>\n<body ",(_1d?"id='dijitEditorBody' ":""),"onload='frameElement._loadFunc(window,document)' style='"+_20+"'>",_1c,"</body>\n</html>"].join("");
},_applyEditingAreaStyleSheets:function(){
var _24=[];
if(this.styleSheets){
_24=this.styleSheets.split(";");
this.styleSheets="";
}
_24=_24.concat(this.editingAreaStyleSheets);
this.editingAreaStyleSheets=[];
var _25="",i=0,url;
while((url=_24[i++])){
var _26=(new _1._Url(_1.global.location,url)).toString();
this.editingAreaStyleSheets.push(_26);
_25+="<link rel=\"stylesheet\" type=\"text/css\" href=\""+_26+"\"/>";
}
return _25;
},addStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)==="."||(url.charAt(0)!=="/"&&!uri.host)){
url=(new _1._Url(_1.global.location,url)).toString();
}
if(_1.indexOf(this.editingAreaStyleSheets,url)>-1){
return;
}
this.editingAreaStyleSheets.push(url);
this.onLoadDeferred.addCallback(_1.hitch(this,function(){
if(this.document.createStyleSheet){
this.document.createStyleSheet(url);
}else{
var _27=this.document.getElementsByTagName("head")[0];
var _28=this.document.createElement("link");
_28.rel="stylesheet";
_28.type="text/css";
_28.href=url;
_27.appendChild(_28);
}
}));
},removeStyleSheet:function(uri){
var url=uri.toString();
if(url.charAt(0)==="."||(url.charAt(0)!=="/"&&!uri.host)){
url=(new _1._Url(_1.global.location,url)).toString();
}
var _29=_1.indexOf(this.editingAreaStyleSheets,url);
if(_29===-1){
return;
}
delete this.editingAreaStyleSheets[_29];
_1.withGlobal(this.window,"query",_1,["link:[href=\""+url+"\"]"]).orphan();
},disabled:false,_mozSettingProps:{"styleWithCSS":false},_setDisabledAttr:function(_2a){
_2a=!!_2a;
this._set("disabled",_2a);
if(!this.isLoaded){
return;
}
if(_1.isIE||_1.isWebKit||_1.isOpera){
var _2b=_1.isIE&&(this.isLoaded||!this.focusOnLoad);
if(_2b){
this.editNode.unselectable="on";
}
this.editNode.contentEditable=!_2a;
if(_2b){
var _2c=this;
setTimeout(function(){
_2c.editNode.unselectable="off";
},0);
}
}else{
try{
this.document.designMode=(_2a?"off":"on");
}
catch(e){
return;
}
if(!_2a&&this._mozSettingProps){
var ps=this._mozSettingProps;
var n;
for(n in ps){
if(ps.hasOwnProperty(n)){
try{
this.document.execCommand(n,false,ps[n]);
}
catch(e2){
}
}
}
}
}
this._disabledOK=true;
},onLoad:function(_2d){
if(!this.window.__registeredWindow){
this.window.__registeredWindow=true;
this._iframeRegHandle=_2.registerIframe(this.iframe);
}
if(!_1.isIE&&!_1.isWebKit&&(this.height||_1.isMoz)){
this.editNode=this.document.body;
}else{
this.editNode=this.document.body.firstChild;
var _2e=this;
if(_1.isIE){
this.tabStop=_1.create("div",{tabIndex:-1},this.editingArea);
this.iframe.onfocus=function(){
_2e.editNode.setActive();
};
}
}
this.focusNode=this.editNode;
var _2f=this.events.concat(this.captureEvents);
var ap=this.iframe?this.document:this.editNode;
_1.forEach(_2f,function(_30){
this.connect(ap,_30.toLowerCase(),_30);
},this);
this.connect(ap,"onmouseup","onClick");
if(_1.isIE){
this.connect(this.document,"onmousedown","_onIEMouseDown");
this.editNode.style.zoom=1;
}else{
this.connect(this.document,"onmousedown",function(){
delete this._cursorToStart;
});
}
if(_1.isWebKit){
this._webkitListener=this.connect(this.document,"onmouseup","onDisplayChanged");
this.connect(this.document,"onmousedown",function(e){
var t=e.target;
if(t&&(t===this.document.body||t===this.document)){
setTimeout(_1.hitch(this,"placeCursorAtEnd"),0);
}
});
}
if(_1.isIE){
try{
this.document.execCommand("RespectVisibilityInDesign",true,null);
}
catch(e){
}
}
this.isLoaded=true;
this.set("disabled",this.disabled);
var _31=_1.hitch(this,function(){
this.setValue(_2d);
if(this.onLoadDeferred){
this.onLoadDeferred.callback(true);
}
this.onDisplayChanged();
if(this.focusOnLoad){
_1.addOnLoad(_1.hitch(this,function(){
setTimeout(_1.hitch(this,"focus"),this.updateInterval);
}));
}
this.value=this.getValue(true);
});
if(this.setValueDeferred){
this.setValueDeferred.addCallback(_31);
}else{
_31();
}
},onKeyDown:function(e){
if(e.keyCode===_1.keys.TAB&&this.isTabIndent){
_1.stopEvent(e);
if(this.queryCommandEnabled((e.shiftKey?"outdent":"indent"))){
this.execCommand((e.shiftKey?"outdent":"indent"));
}
}
if(_1.isIE){
if(e.keyCode==_1.keys.TAB&&!this.isTabIndent){
if(e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.iframe.focus();
}else{
if(!e.shiftKey&&!e.ctrlKey&&!e.altKey){
this.tabStop.focus();
}
}
}else{
if(e.keyCode===_1.keys.BACKSPACE&&this.document.selection.type==="Control"){
_1.stopEvent(e);
this.execCommand("delete");
}else{
if((65<=e.keyCode&&e.keyCode<=90)||(e.keyCode>=37&&e.keyCode<=40)){
e.charCode=e.keyCode;
this.onKeyPress(e);
}
}
}
}
return true;
},onKeyUp:function(e){
},setDisabled:function(_32){
_1.deprecated("dijit.Editor::setDisabled is deprecated","use dijit.Editor::attr(\"disabled\",boolean) instead",2);
this.set("disabled",_32);
},_setValueAttr:function(_33){
this.setValue(_33);
},_setDisableSpellCheckAttr:function(_34){
if(this.document){
_1.attr(this.document.body,"spellcheck",!_34);
}else{
this.onLoadDeferred.addCallback(_1.hitch(this,function(){
_1.attr(this.document.body,"spellcheck",!_34);
}));
}
this._set("disableSpellCheck",_34);
},onKeyPress:function(e){
var c=(e.keyChar&&e.keyChar.toLowerCase())||e.keyCode,_35=this._keyHandlers[c],_36=arguments;
if(_35&&!e.altKey){
_1.some(_35,function(h){
if(!(h.shift^e.shiftKey)&&!(h.ctrl^(e.ctrlKey||e.metaKey))){
if(!h.handler.apply(this,_36)){
e.preventDefault();
}
return true;
}
},this);
}
if(!this._onKeyHitch){
this._onKeyHitch=_1.hitch(this,"onKeyPressed");
}
setTimeout(this._onKeyHitch,1);
return true;
},addKeyHandler:function(key,_37,_38,_39){
if(!_1.isArray(this._keyHandlers[key])){
this._keyHandlers[key]=[];
}
this._keyHandlers[key].push({shift:_38||false,ctrl:_37||false,handler:_39});
},onKeyPressed:function(){
this.onDisplayChanged();
},onClick:function(e){
this.onDisplayChanged(e);
},_onIEMouseDown:function(e){
if(!this.focused&&!this.disabled){
this.focus();
}
},_onBlur:function(e){
this.inherited(arguments);
var _3a=this.getValue(true);
if(_3a!==this.value){
this.onChange(_3a);
}
this._set("value",_3a);
},_onFocus:function(e){
if(!this.disabled){
if(!this._disabledOK){
this.set("disabled",false);
}
this.inherited(arguments);
}
},blur:function(){
if(!_1.isIE&&this.window.document.documentElement&&this.window.document.documentElement.focus){
this.window.document.documentElement.focus();
}else{
if(_1.doc.body.focus){
_1.doc.body.focus();
}
}
},focus:function(){
if(!this.isLoaded){
this.focusOnLoad=true;
return;
}
if(this._cursorToStart){
delete this._cursorToStart;
if(this.editNode.childNodes){
this.placeCursorAtStart();
return;
}
}
if(!_1.isIE){
_2.focus(this.iframe);
}else{
if(this.editNode&&this.editNode.focus){
this.iframe.fireEvent("onfocus",document.createEventObject());
}
}
},updateInterval:200,_updateTimer:null,onDisplayChanged:function(e){
if(this._updateTimer){
clearTimeout(this._updateTimer);
}
if(!this._updateHandler){
this._updateHandler=_1.hitch(this,"onNormalizedDisplayChanged");
}
this._updateTimer=setTimeout(this._updateHandler,this.updateInterval);
},onNormalizedDisplayChanged:function(){
delete this._updateTimer;
},onChange:function(_3b){
},_normalizeCommand:function(cmd,_3c){
var _3d=cmd.toLowerCase();
if(_3d==="formatblock"){
if(_1.isSafari&&_3c===undefined){
_3d="heading";
}
}else{
if(_3d==="hilitecolor"&&!_1.isMoz){
_3d="backcolor";
}
}
return _3d;
},_qcaCache:{},queryCommandAvailable:function(_3e){
var ca=this._qcaCache[_3e];
if(ca!==undefined){
return ca;
}
return (this._qcaCache[_3e]=this._queryCommandAvailable(_3e));
},_queryCommandAvailable:function(_3f){
var ie=1;
var _40=1<<1;
var _41=1<<2;
var _42=1<<3;
function _43(_44){
return {ie:Boolean(_44&ie),mozilla:Boolean(_44&_40),webkit:Boolean(_44&_41),opera:Boolean(_44&_42)};
};
var _45=null;
switch(_3f.toLowerCase()){
case "bold":
case "italic":
case "underline":
case "subscript":
case "superscript":
case "fontname":
case "fontsize":
case "forecolor":
case "hilitecolor":
case "justifycenter":
case "justifyfull":
case "justifyleft":
case "justifyright":
case "delete":
case "selectall":
case "toggledir":
_45=_43(_40|ie|_41|_42);
break;
case "createlink":
case "unlink":
case "removeformat":
case "inserthorizontalrule":
case "insertimage":
case "insertorderedlist":
case "insertunorderedlist":
case "indent":
case "outdent":
case "formatblock":
case "inserthtml":
case "undo":
case "redo":
case "strikethrough":
case "tabindent":
_45=_43(_40|ie|_42|_41);
break;
case "blockdirltr":
case "blockdirrtl":
case "dirltr":
case "dirrtl":
case "inlinedirltr":
case "inlinedirrtl":
_45=_43(ie);
break;
case "cut":
case "copy":
case "paste":
_45=_43(ie|_40|_41);
break;
case "inserttable":
_45=_43(_40|ie);
break;
case "insertcell":
case "insertcol":
case "insertrow":
case "deletecells":
case "deletecols":
case "deleterows":
case "mergecells":
case "splitcell":
_45=_43(ie|_40);
break;
default:
return false;
}
return (_1.isIE&&_45.ie)||(_1.isMoz&&_45.mozilla)||(_1.isWebKit&&_45.webkit)||(_1.isOpera&&_45.opera);
},execCommand:function(_46,_47){
var _48;
this.focus();
_46=this._normalizeCommand(_46,_47);
if(_47!==undefined){
if(_46==="heading"){
throw new Error("unimplemented");
}else{
if((_46==="formatblock")&&_1.isIE){
_47="<"+_47+">";
}
}
}
var _49="_"+_46+"Impl";
if(this[_49]){
_48=this[_49](_47);
}else{
_47=arguments.length>1?_47:null;
if(_47||_46!=="createlink"){
_48=this.document.execCommand(_46,false,_47);
}
}
this.onDisplayChanged();
return _48;
},queryCommandEnabled:function(_4a){
if(this.disabled||!this._disabledOK){
return false;
}
_4a=this._normalizeCommand(_4a);
var _4b="_"+_4a+"EnabledImpl";
if(this[_4b]){
return this[_4b](_4a);
}else{
return this._browserQueryCommandEnabled(_4a);
}
},queryCommandState:function(_4c){
if(this.disabled||!this._disabledOK){
return false;
}
_4c=this._normalizeCommand(_4c);
try{
return this.document.queryCommandState(_4c);
}
catch(e){
return false;
}
},queryCommandValue:function(_4d){
if(this.disabled||!this._disabledOK){
return false;
}
var r;
_4d=this._normalizeCommand(_4d);
if(_1.isIE&&_4d==="formatblock"){
r=this._native2LocalFormatNames[this.document.queryCommandValue(_4d)];
}else{
if(_1.isMoz&&_4d==="hilitecolor"){
var _4e;
try{
_4e=this.document.queryCommandValue("styleWithCSS");
}
catch(e){
_4e=false;
}
this.document.execCommand("styleWithCSS",false,true);
r=this.document.queryCommandValue(_4d);
this.document.execCommand("styleWithCSS",false,_4e);
}else{
r=this.document.queryCommandValue(_4d);
}
}
return r;
},_sCall:function(_4f,_50){
return _1.withGlobal(this.window,_4f,_2._editor.selection,_50);
},placeCursorAtStart:function(){
this.focus();
var _51=false;
if(_1.isMoz){
var _52=this.editNode.firstChild;
while(_52){
if(_52.nodeType===3){
if(_52.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_51=true;
this._sCall("selectElement",[_52]);
break;
}
}else{
if(_52.nodeType===1){
_51=true;
var tg=_52.tagName?_52.tagName.toLowerCase():"";
if(/br|input|img|base|meta|area|basefont|hr|link/.test(tg)){
this._sCall("selectElement",[_52]);
}else{
this._sCall("selectElementChildren",[_52]);
}
break;
}
}
_52=_52.nextSibling;
}
}else{
_51=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_51){
this._sCall("collapse",[true]);
}
},placeCursorAtEnd:function(){
this.focus();
var _53=false;
if(_1.isMoz){
var _54=this.editNode.lastChild;
while(_54){
if(_54.nodeType===3){
if(_54.nodeValue.replace(/^\s+|\s+$/g,"").length>0){
_53=true;
this._sCall("selectElement",[_54]);
break;
}
}else{
if(_54.nodeType===1){
_53=true;
if(_54.lastChild){
this._sCall("selectElement",[_54.lastChild]);
}else{
this._sCall("selectElement",[_54]);
}
break;
}
}
_54=_54.previousSibling;
}
}else{
_53=true;
this._sCall("selectElementChildren",[this.editNode]);
}
if(_53){
this._sCall("collapse",[false]);
}
},getValue:function(_55){
if(this.textarea){
if(this.isClosed||!this.isLoaded){
return this.textarea.value;
}
}
return this._postFilterContent(null,_55);
},_getValueAttr:function(){
return this.getValue(true);
},setValue:function(_56){
if(!this.isLoaded){
this.onLoadDeferred.addCallback(_1.hitch(this,function(){
this.setValue(_56);
}));
return;
}
this._cursorToStart=true;
if(this.textarea&&(this.isClosed||!this.isLoaded)){
this.textarea.value=_56;
}else{
_56=this._preFilterContent(_56);
var _57=this.isClosed?this.domNode:this.editNode;
if(_56&&_1.isMoz&&_56.toLowerCase()==="<p></p>"){
_56="<p>&nbsp;</p>";
}
if(!_56&&_1.isWebKit){
_56="&nbsp;";
}
_57.innerHTML=_56;
this._preDomFilterContent(_57);
}
this.onDisplayChanged();
this._set("value",this.getValue(true));
},replaceValue:function(_58){
if(this.isClosed){
this.setValue(_58);
}else{
if(this.window&&this.window.getSelection&&!_1.isMoz){
this.setValue(_58);
}else{
if(this.window&&this.window.getSelection){
_58=this._preFilterContent(_58);
this.execCommand("selectall");
if(!_58){
this._cursorToStart=true;
_58="&nbsp;";
}
this.execCommand("inserthtml",_58);
this._preDomFilterContent(this.editNode);
}else{
if(this.document&&this.document.selection){
this.setValue(_58);
}
}
}
}
this._set("value",this.getValue(true));
},_preFilterContent:function(_59){
var ec=_59;
_1.forEach(this.contentPreFilters,function(ef){
if(ef){
ec=ef(ec);
}
});
return ec;
},_preDomFilterContent:function(dom){
dom=dom||this.editNode;
_1.forEach(this.contentDomPreFilters,function(ef){
if(ef&&_1.isFunction(ef)){
ef(dom);
}
},this);
},_postFilterContent:function(dom,_5a){
var ec;
if(!_1.isString(dom)){
dom=dom||this.editNode;
if(this.contentDomPostFilters.length){
if(_5a){
dom=_1.clone(dom);
}
_1.forEach(this.contentDomPostFilters,function(ef){
dom=ef(dom);
});
}
ec=_2._editor.getChildrenHtml(dom);
}else{
ec=dom;
}
if(!_1.trim(ec.replace(/^\xA0\xA0*/,"").replace(/\xA0\xA0*$/,"")).length){
ec="";
}
_1.forEach(this.contentPostFilters,function(ef){
ec=ef(ec);
});
return ec;
},_saveContent:function(e){
var _5b=_1.byId(_2._scopeName+"._editor.RichText.value");
if(_5b){
if(_5b.value){
_5b.value+=this._SEPARATOR;
}
_5b.value+=this.name+this._NAME_CONTENT_SEP+this.getValue(true);
}
},escapeXml:function(str,_5c){
str=str.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;").replace(/"/gm,"&quot;");
if(!_5c){
str=str.replace(/'/gm,"&#39;");
}
return str;
},getNodeHtml:function(_5d){
_1.deprecated("dijit.Editor::getNodeHtml is deprecated","use dijit._editor.getNodeHtml instead",2);
return _2._editor.getNodeHtml(_5d);
},getNodeChildrenHtml:function(dom){
_1.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated","use dijit._editor.getChildrenHtml instead",2);
return _2._editor.getChildrenHtml(dom);
},close:function(_5e){
if(this.isClosed){
return;
}
if(!arguments.length){
_5e=true;
}
if(_5e){
this._set("value",this.getValue(true));
}
if(this.interval){
clearInterval(this.interval);
}
if(this._webkitListener){
this.disconnect(this._webkitListener);
delete this._webkitListener;
}
if(_1.isIE){
this.iframe.onfocus=null;
}
this.iframe._loadFunc=null;
if(this._iframeRegHandle){
_2.unregisterIframe(this._iframeRegHandle);
delete this._iframeRegHandle;
}
if(this.textarea){
var s=this.textarea.style;
s.position="";
s.left=s.top="";
if(_1.isIE){
s.overflow=this.__overflow;
this.__overflow=null;
}
this.textarea.value=this.value;
_1.destroy(this.domNode);
this.domNode=this.textarea;
}else{
this.domNode.innerHTML=this.value;
}
delete this.iframe;
_1.removeClass(this.domNode,this.baseClass);
this.isClosed=true;
this.isLoaded=false;
delete this.editNode;
delete this.focusNode;
if(this.window&&this.window._frameElement){
this.window._frameElement=null;
}
this.window=null;
this.document=null;
this.editingArea=null;
this.editorObject=null;
},destroy:function(){
if(!this.isClosed){
this.close(false);
}
this.inherited(arguments);
if(_2._editor._globalSaveHandler){
delete _2._editor._globalSaveHandler[this.id];
}
},_removeMozBogus:function(_5f){
return _5f.replace(/\stype="_moz"/gi,"").replace(/\s_moz_dirty=""/gi,"").replace(/_moz_resizing="(true|false)"/gi,"");
},_removeWebkitBogus:function(_60){
_60=_60.replace(/\sclass="webkit-block-placeholder"/gi,"");
_60=_60.replace(/\sclass="apple-style-span"/gi,"");
_60=_60.replace(/<meta charset=\"utf-8\" \/>/gi,"");
return _60;
},_normalizeFontStyle:function(_61){
return _61.replace(/<(\/)?strong([ \>])/gi,"<$1b$2").replace(/<(\/)?em([ \>])/gi,"<$1i$2");
},_preFixUrlAttributes:function(_62){
return _62.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi,"$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
},_browserQueryCommandEnabled:function(_63){
if(!_63){
return false;
}
var _64=_1.isIE?this.document.selection.createRange():this.document;
try{
return _64.queryCommandEnabled(_63);
}
catch(e){
return false;
}
},_createlinkEnabledImpl:function(_65){
var _66=true;
if(_1.isOpera){
var sel=this.window.getSelection();
if(sel.isCollapsed){
_66=true;
}else{
_66=this.document.queryCommandEnabled("createlink");
}
}else{
_66=this._browserQueryCommandEnabled("createlink");
}
return _66;
},_unlinkEnabledImpl:function(_67){
var _68=true;
if(_1.isMoz||_1.isWebKit){
_68=this._sCall("hasAncestorElement",["a"]);
}else{
_68=this._browserQueryCommandEnabled("unlink");
}
return _68;
},_unlinkEnabledImpl:function(_69){
var _6a=true;
if(_1.isMoz||_1.isWebKit){
_6a=this._sCall("hasAncestorElement",["a"]);
}else{
_6a=this._browserQueryCommandEnabled("unlink");
}
return _6a;
},_inserttableEnabledImpl:function(_6b){
var _6c=true;
if(_1.isMoz||_1.isWebKit){
_6c=true;
}else{
_6c=this._browserQueryCommandEnabled("inserttable");
}
return _6c;
},_cutEnabledImpl:function(_6d){
var _6e=true;
if(_1.isWebKit){
var sel=this.window.getSelection();
if(sel){
sel=sel.toString();
}
_6e=!!sel;
}else{
_6e=this._browserQueryCommandEnabled("cut");
}
return _6e;
},_copyEnabledImpl:function(_6f){
var _70=true;
if(_1.isWebKit){
var sel=this.window.getSelection();
if(sel){
sel=sel.toString();
}
_70=!!sel;
}else{
_70=this._browserQueryCommandEnabled("copy");
}
return _70;
},_pasteEnabledImpl:function(_71){
var _72=true;
if(_1.isWebKit){
return true;
}else{
_72=this._browserQueryCommandEnabled("paste");
}
return _72;
},_inserthorizontalruleImpl:function(_73){
if(_1.isIE){
return this._inserthtmlImpl("<hr>");
}
return this.document.execCommand("inserthorizontalrule",false,_73);
},_unlinkImpl:function(_74){
if((this.queryCommandEnabled("unlink"))&&(_1.isMoz||_1.isWebKit)){
var a=this._sCall("getAncestorElement",["a"]);
this._sCall("selectElement",[a]);
return this.document.execCommand("unlink",false,null);
}
return this.document.execCommand("unlink",false,_74);
},_hilitecolorImpl:function(_75){
var _76;
if(_1.isMoz){
this.document.execCommand("styleWithCSS",false,true);
_76=this.document.execCommand("hilitecolor",false,_75);
this.document.execCommand("styleWithCSS",false,false);
}else{
_76=this.document.execCommand("hilitecolor",false,_75);
}
return _76;
},_backcolorImpl:function(_77){
if(_1.isIE){
_77=_77?_77:null;
}
return this.document.execCommand("backcolor",false,_77);
},_forecolorImpl:function(_78){
if(_1.isIE){
_78=_78?_78:null;
}
return this.document.execCommand("forecolor",false,_78);
},_inserthtmlImpl:function(_79){
_79=this._preFilterContent(_79);
var rv=true;
if(_1.isIE){
var _7a=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()==="CONTROL"){
var n=_7a.item(0);
while(_7a.length){
_7a.remove(_7a.item(0));
}
n.outerHTML=_79;
}else{
_7a.pasteHTML(_79);
}
_7a.select();
}else{
if(_1.isMoz&&!_79.length){
this._sCall("remove");
}else{
rv=this.document.execCommand("inserthtml",false,_79);
}
}
return rv;
},_boldImpl:function(_7b){
var _7c=false;
if(_1.isIE){
this._adaptIESelection();
_7c=this._adaptIEFormatAreaAndExec("bold");
}
if(!_7c){
_7c=this.document.execCommand("bold",false,_7b);
}
return _7c;
},_italicImpl:function(_7d){
var _7e=false;
if(_1.isIE){
this._adaptIESelection();
_7e=this._adaptIEFormatAreaAndExec("italic");
}
if(!_7e){
_7e=this.document.execCommand("italic",false,_7d);
}
return _7e;
},_underlineImpl:function(_7f){
var _80=false;
if(_1.isIE){
this._adaptIESelection();
_80=this._adaptIEFormatAreaAndExec("underline");
}
if(!_80){
_80=this.document.execCommand("underline",false,_7f);
}
return _80;
},_strikethroughImpl:function(_81){
var _82=false;
if(_1.isIE){
this._adaptIESelection();
_82=this._adaptIEFormatAreaAndExec("strikethrough");
}
if(!_82){
_82=this.document.execCommand("strikethrough",false,_81);
}
return _82;
},_superscriptImpl:function(_83){
var _84=false;
if(_1.isIE){
this._adaptIESelection();
alreadyApplied=this._adaptIEFormatAreaAndExec("superscript");
}
if(!_84){
_84=this.document.execCommand("superscript",false,_83);
}
return _84;
},_subscriptImpl:function(_85){
var _86=false;
if(_1.isIE){
this._adaptIESelection();
_86=this._adaptIEFormatAreaAndExec("subscript");
}
if(!_86){
_86=this.document.execCommand("subscript",false,_85);
}
return _86;
},getHeaderHeight:function(){
return this._getNodeChildrenHeight(this.header);
},getFooterHeight:function(){
return this._getNodeChildrenHeight(this.footer);
},_getNodeChildrenHeight:function(_87){
var h=0;
if(_87&&_87.childNodes){
var i;
for(i=0;i<_87.childNodes.length;i++){
var _88=_1.position(_87.childNodes[i]);
h+=_88.h;
}
}
return h;
},_isNodeEmpty:function(_89,_8a){
if(_89.nodeType===1){
if(_89.childNodes.length>0){
return this._isNodeEmpty(_89.childNodes[0],_8a);
}
return true;
}else{
if(_89.nodeType===3){
return (_89.nodeValue.substring(_8a)==="");
}
}
return false;
},_removeStartingRangeFromRange:function(_8b,_8c){
if(_8b.nextSibling){
_8c.setStart(_8b.nextSibling,0);
}else{
var _8d=_8b.parentNode;
while(_8d&&_8d.nextSibling==null){
_8d=_8d.parentNode;
}
if(_8d){
_8c.setStart(_8d.nextSibling,0);
}
}
return _8c;
},_adaptIESelection:function(){
var _8e=_2.range.getSelection(this.window);
if(_8e&&_8e.rangeCount&&!_8e.isCollapsed){
var _8f=_8e.getRangeAt(0);
var _90=_8f.startContainer;
var _91=_8f.startOffset;
while(_90.nodeType===3&&_91>=_90.length&&_90.nextSibling){
_91=_91-_90.length;
_90=_90.nextSibling;
}
var _92=null;
while(this._isNodeEmpty(_90,_91)&&_90!==_92){
_92=_90;
_8f=this._removeStartingRangeFromRange(_90,_8f);
_90=_8f.startContainer;
_91=0;
}
_8e.removeAllRanges();
_8e.addRange(_8f);
}
},_adaptIEFormatAreaAndExec:function(_93){
var _94=_2.range.getSelection(this.window);
var doc=this.document;
var rs,ret,_95,txt,_96,_97,_98,_99;
if(_93&&_94&&_94.isCollapsed){
var _9a=this.queryCommandValue(_93);
if(_9a){
var _9b=this._tagNamesForCommand(_93);
_95=_94.getRangeAt(0);
var fs=_95.startContainer;
if(fs.nodeType===3){
var _9c=_95.endOffset;
if(fs.length<_9c){
ret=this._adjustNodeAndOffset(rs,_9c);
fs=ret.node;
_9c=ret.offset;
}
}
var _9d;
while(fs&&fs!==this.editNode){
var _9e=fs.tagName?fs.tagName.toLowerCase():"";
if(_1.indexOf(_9b,_9e)>-1){
_9d=fs;
break;
}
fs=fs.parentNode;
}
if(_9d){
var _9f;
rs=_95.startContainer;
var _a0=doc.createElement(_9d.tagName);
_1.place(_a0,_9d,"after");
if(rs&&rs.nodeType===3){
var _a1,_a2;
var _a3=_95.endOffset;
if(rs.length<_a3){
ret=this._adjustNodeAndOffset(rs,_a3);
rs=ret.node;
_a3=ret.offset;
}
txt=rs.nodeValue;
_96=doc.createTextNode(txt.substring(0,_a3));
var _a4=txt.substring(_a3,txt.length);
if(_a4){
_97=doc.createTextNode(_a4);
}
_1.place(_96,rs,"before");
if(_97){
_98=doc.createElement("span");
_98.className="ieFormatBreakerSpan";
_1.place(_98,rs,"after");
_1.place(_97,_98,"after");
_97=_98;
}
_1.destroy(rs);
var _a5=_96.parentNode;
var _a6=[];
var _a7;
while(_a5!==_9d){
var tg=_a5.tagName;
_a7={tagName:tg};
_a6.push(_a7);
var _a8=doc.createElement(tg);
if(_a5.style){
if(_a8.style){
if(_a5.style.cssText){
_a8.style.cssText=_a5.style.cssText;
_a7.cssText=_a5.style.cssText;
}
}
}
if(_a5.tagName==="FONT"){
if(_a5.color){
_a8.color=_a5.color;
_a7.color=_a5.color;
}
if(_a5.face){
_a8.face=_a5.face;
_a7.face=_a5.face;
}
if(_a5.size){
_a8.size=_a5.size;
_a7.size=_a5.size;
}
}
if(_a5.className){
_a8.className=_a5.className;
_a7.className=_a5.className;
}
if(_97){
_a1=_97;
while(_a1){
_a2=_a1.nextSibling;
_a8.appendChild(_a1);
_a1=_a2;
}
}
if(_a8.tagName==_a5.tagName){
_98=doc.createElement("span");
_98.className="ieFormatBreakerSpan";
_1.place(_98,_a5,"after");
_1.place(_a8,_98,"after");
}else{
_1.place(_a8,_a5,"after");
}
_96=_a5;
_97=_a8;
_a5=_a5.parentNode;
}
if(_97){
_a1=_97;
if(_a1.nodeType===1||(_a1.nodeType===3&&_a1.nodeValue)){
_a0.innerHTML="";
}
while(_a1){
_a2=_a1.nextSibling;
_a0.appendChild(_a1);
_a1=_a2;
}
}
if(_a6.length){
_a7=_a6.pop();
var _a9=doc.createElement(_a7.tagName);
if(_a7.cssText&&_a9.style){
_a9.style.cssText=_a7.cssText;
}
if(_a7.className){
_a9.className=_a7.className;
}
if(_a7.tagName==="FONT"){
if(_a7.color){
_a9.color=_a7.color;
}
if(_a7.face){
_a9.face=_a7.face;
}
if(_a7.size){
_a9.size=_a7.size;
}
}
_1.place(_a9,_a0,"before");
while(_a6.length){
_a7=_a6.pop();
var _aa=doc.createElement(_a7.tagName);
if(_a7.cssText&&_aa.style){
_aa.style.cssText=_a7.cssText;
}
if(_a7.className){
_aa.className=_a7.className;
}
if(_a7.tagName==="FONT"){
if(_a7.color){
_aa.color=_a7.color;
}
if(_a7.face){
_aa.face=_a7.face;
}
if(_a7.size){
_aa.size=_a7.size;
}
}
_a9.appendChild(_aa);
_a9=_aa;
}
_99=doc.createTextNode(".");
_98.appendChild(_99);
_a9.appendChild(_99);
_1.withGlobal(this.window,_1.hitch(this,function(){
var _ab=_2.range.create(_1.gobal);
_ab.setStart(_99,0);
_ab.setEnd(_99,_99.length);
_94.removeAllRanges();
_94.addRange(_ab);
_2._editor.selection.collapse(false);
_99.parentNode.innerHTML="";
}));
}else{
_98=doc.createElement("span");
_98.className="ieFormatBreakerSpan";
_99=doc.createTextNode(".");
_98.appendChild(_99);
_1.place(_98,_a0,"before");
_1.withGlobal(this.window,_1.hitch(this,function(){
var _ac=_2.range.create(_1.gobal);
_ac.setStart(_99,0);
_ac.setEnd(_99,_99.length);
_94.removeAllRanges();
_94.addRange(_ac);
_2._editor.selection.collapse(false);
_99.parentNode.innerHTML="";
}));
}
if(!_a0.firstChild){
_1.destroy(_a0);
}
return true;
}
}
return false;
}else{
_95=_94.getRangeAt(0);
rs=_95.startContainer;
if(rs&&rs.nodeType===3){
_1.withGlobal(this.window,_1.hitch(this,function(){
var _ad=false;
var _ae=_95.startOffset;
if(rs.length<_ae){
ret=this._adjustNodeAndOffset(rs,_ae);
rs=ret.node;
_ae=ret.offset;
}
txt=rs.nodeValue;
_96=doc.createTextNode(txt.substring(0,_ae));
var _af=txt.substring(_ae);
if(_af!==""){
_97=doc.createTextNode(txt.substring(_ae));
}
_98=doc.createElement("span");
_99=doc.createTextNode(".");
_98.appendChild(_99);
if(_96.length){
_1.place(_96,rs,"after");
}else{
_96=rs;
}
_1.place(_98,_96,"after");
if(_97){
_1.place(_97,_98,"after");
}
_1.destroy(rs);
var _b0=_2.range.create(_1.gobal);
_b0.setStart(_99,0);
_b0.setEnd(_99,_99.length);
_94.removeAllRanges();
_94.addRange(_b0);
doc.execCommand(_93);
_1.place(_98.firstChild,_98,"before");
_1.destroy(_98);
_b0.setStart(_99,0);
_b0.setEnd(_99,_99.length);
_94.removeAllRanges();
_94.addRange(_b0);
_2._editor.selection.collapse(false);
_99.parentNode.innerHTML="";
}));
return true;
}
}
}else{
return false;
}
},_adjustNodeAndOffset:function(_b1,_b2){
while(_b1.length<_b2&&_b1.nextSibling&&_b1.nextSibling.nodeType===3){
_b2=_b2-_b1.length;
_b1=_b1.nextSibling;
}
return {"node":_b1,"offset":_b2};
},_tagNamesForCommand:function(_b3){
if(_b3==="bold"){
return ["b","strong"];
}else{
if(_b3==="italic"){
return ["i","em"];
}else{
if(_b3==="strikethrough"){
return ["s","strike"];
}else{
if(_b3==="superscript"){
return ["sup"];
}else{
if(_b3==="subscript"){
return ["sub"];
}else{
if(_b3==="underline"){
return ["u"];
}
}
}
}
}
}
return [];
},_stripBreakerNodes:function(_b4){
_1.withGlobal(this.window,_1.hitch(this,function(){
var _b5=_1.query(".ieFormatBreakerSpan",_b4);
var i;
for(i=0;i<_b5.length;i++){
var b=_b5[i];
while(b.firstChild){
_1.place(b.firstChild,b,"before");
}
_1.destroy(b);
}
}));
return _b4;
}});
return _2._editor.RichText;
});
