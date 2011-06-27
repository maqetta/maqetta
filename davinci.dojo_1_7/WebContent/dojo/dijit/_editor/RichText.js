/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
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
var _77=this._handleTextColorOrProperties("hilitecolor",_75);
if(!_77){
if(_1.isMoz){
this.document.execCommand("styleWithCSS",false,true);
_76=this.document.execCommand("hilitecolor",false,_75);
this.document.execCommand("styleWithCSS",false,false);
}else{
_76=this.document.execCommand("hilitecolor",false,_75);
}
}
return _76;
},_backcolorImpl:function(_78){
if(_1.isIE){
_78=_78?_78:null;
}
var _79=this._handleTextColorOrProperties("backcolor",_78);
if(!_79){
_79=this.document.execCommand("backcolor",false,_78);
}
return _79;
},_forecolorImpl:function(_7a){
if(_1.isIE){
_7a=_7a?_7a:null;
}
var _7b=false;
_7b=this._handleTextColorOrProperties("forecolor",_7a);
if(!_7b){
_7b=this.document.execCommand("forecolor",false,_7a);
}
return _7b;
},_inserthtmlImpl:function(_7c){
_7c=this._preFilterContent(_7c);
var rv=true;
if(_1.isIE){
var _7d=this.document.selection.createRange();
if(this.document.selection.type.toUpperCase()==="CONTROL"){
var n=_7d.item(0);
while(_7d.length){
_7d.remove(_7d.item(0));
}
n.outerHTML=_7c;
}else{
_7d.pasteHTML(_7c);
}
_7d.select();
}else{
if(_1.isMoz&&!_7c.length){
this._sCall("remove");
}else{
rv=this.document.execCommand("inserthtml",false,_7c);
}
}
return rv;
},_boldImpl:function(_7e){
var _7f=false;
if(_1.isIE){
this._adaptIESelection();
_7f=this._adaptIEFormatAreaAndExec("bold");
}
if(!_7f){
_7f=this.document.execCommand("bold",false,_7e);
}
return _7f;
},_italicImpl:function(_80){
var _81=false;
if(_1.isIE){
this._adaptIESelection();
_81=this._adaptIEFormatAreaAndExec("italic");
}
if(!_81){
_81=this.document.execCommand("italic",false,_80);
}
return _81;
},_underlineImpl:function(_82){
var _83=false;
if(_1.isIE){
this._adaptIESelection();
_83=this._adaptIEFormatAreaAndExec("underline");
}
if(!_83){
_83=this.document.execCommand("underline",false,_82);
}
return _83;
},_strikethroughImpl:function(_84){
var _85=false;
if(_1.isIE){
this._adaptIESelection();
_85=this._adaptIEFormatAreaAndExec("strikethrough");
}
if(!_85){
_85=this.document.execCommand("strikethrough",false,_84);
}
return _85;
},_superscriptImpl:function(_86){
var _87=false;
if(_1.isIE){
this._adaptIESelection();
alreadyApplied=this._adaptIEFormatAreaAndExec("superscript");
}
if(!_87){
_87=this.document.execCommand("superscript",false,_86);
}
return _87;
},_subscriptImpl:function(_88){
var _89=false;
if(_1.isIE){
this._adaptIESelection();
_89=this._adaptIEFormatAreaAndExec("subscript");
}
if(!_89){
_89=this.document.execCommand("subscript",false,_88);
}
return _89;
},_fontnameImpl:function(_8a){
var _8b;
if(_1.isIE){
_8b=this._handleTextColorOrProperties("fontname",_8a);
}
if(!_8b){
_8b=this.document.execCommand("fontname",false,_8a);
}
return _8b;
},_fontsizeImpl:function(_8c){
var _8d;
if(_1.isIE){
_8d=this._handleTextColorOrProperties("fontsize",_8c);
}
if(!_8d){
_8d=this.document.execCommand("fontsize",false,_8c);
}
return _8d;
},getHeaderHeight:function(){
return this._getNodeChildrenHeight(this.header);
},getFooterHeight:function(){
return this._getNodeChildrenHeight(this.footer);
},_getNodeChildrenHeight:function(_8e){
var h=0;
if(_8e&&_8e.childNodes){
var i;
for(i=0;i<_8e.childNodes.length;i++){
var _8f=_1.position(_8e.childNodes[i]);
h+=_8f.h;
}
}
return h;
},_isNodeEmpty:function(_90,_91){
if(_90.nodeType===1){
if(_90.childNodes.length>0){
return this._isNodeEmpty(_90.childNodes[0],_91);
}
return true;
}else{
if(_90.nodeType===3){
return (_90.nodeValue.substring(_91)==="");
}
}
return false;
},_removeStartingRangeFromRange:function(_92,_93){
if(_92.nextSibling){
_93.setStart(_92.nextSibling,0);
}else{
var _94=_92.parentNode;
while(_94&&_94.nextSibling==null){
_94=_94.parentNode;
}
if(_94){
_93.setStart(_94.nextSibling,0);
}
}
return _93;
},_adaptIESelection:function(){
var _95=_2.range.getSelection(this.window);
if(_95&&_95.rangeCount&&!_95.isCollapsed){
var _96=_95.getRangeAt(0);
var _97=_96.startContainer;
var _98=_96.startOffset;
while(_97.nodeType===3&&_98>=_97.length&&_97.nextSibling){
_98=_98-_97.length;
_97=_97.nextSibling;
}
var _99=null;
while(this._isNodeEmpty(_97,_98)&&_97!==_99){
_99=_97;
_96=this._removeStartingRangeFromRange(_97,_96);
_97=_96.startContainer;
_98=0;
}
_95.removeAllRanges();
_95.addRange(_96);
}
},_adaptIEFormatAreaAndExec:function(_9a){
var _9b=_2.range.getSelection(this.window);
var doc=this.document;
var rs,ret,_9c,txt,_9d,_9e,_9f,_a0;
if(_9a&&_9b&&_9b.isCollapsed){
var _a1=this.queryCommandValue(_9a);
if(_a1){
var _a2=this._tagNamesForCommand(_9a);
_9c=_9b.getRangeAt(0);
var fs=_9c.startContainer;
if(fs.nodeType===3){
var _a3=_9c.endOffset;
if(fs.length<_a3){
ret=this._adjustNodeAndOffset(rs,_a3);
fs=ret.node;
_a3=ret.offset;
}
}
var _a4;
while(fs&&fs!==this.editNode){
var _a5=fs.tagName?fs.tagName.toLowerCase():"";
if(_1.indexOf(_a2,_a5)>-1){
_a4=fs;
break;
}
fs=fs.parentNode;
}
if(_a4){
var _a6;
rs=_9c.startContainer;
var _a7=doc.createElement(_a4.tagName);
_1.place(_a7,_a4,"after");
if(rs&&rs.nodeType===3){
var _a8,_a9;
var _aa=_9c.endOffset;
if(rs.length<_aa){
ret=this._adjustNodeAndOffset(rs,_aa);
rs=ret.node;
_aa=ret.offset;
}
txt=rs.nodeValue;
_9d=doc.createTextNode(txt.substring(0,_aa));
var _ab=txt.substring(_aa,txt.length);
if(_ab){
_9e=doc.createTextNode(_ab);
}
_1.place(_9d,rs,"before");
if(_9e){
_9f=doc.createElement("span");
_9f.className="ieFormatBreakerSpan";
_1.place(_9f,rs,"after");
_1.place(_9e,_9f,"after");
_9e=_9f;
}
_1.destroy(rs);
var _ac=_9d.parentNode;
var _ad=[];
var _ae;
while(_ac!==_a4){
var tg=_ac.tagName;
_ae={tagName:tg};
_ad.push(_ae);
var _af=doc.createElement(tg);
if(_ac.style){
if(_af.style){
if(_ac.style.cssText){
_af.style.cssText=_ac.style.cssText;
_ae.cssText=_ac.style.cssText;
}
}
}
if(_ac.tagName==="FONT"){
if(_ac.color){
_af.color=_ac.color;
_ae.color=_ac.color;
}
if(_ac.face){
_af.face=_ac.face;
_ae.face=_ac.face;
}
if(_ac.size){
_af.size=_ac.size;
_ae.size=_ac.size;
}
}
if(_ac.className){
_af.className=_ac.className;
_ae.className=_ac.className;
}
if(_9e){
_a8=_9e;
while(_a8){
_a9=_a8.nextSibling;
_af.appendChild(_a8);
_a8=_a9;
}
}
if(_af.tagName==_ac.tagName){
_9f=doc.createElement("span");
_9f.className="ieFormatBreakerSpan";
_1.place(_9f,_ac,"after");
_1.place(_af,_9f,"after");
}else{
_1.place(_af,_ac,"after");
}
_9d=_ac;
_9e=_af;
_ac=_ac.parentNode;
}
if(_9e){
_a8=_9e;
if(_a8.nodeType===1||(_a8.nodeType===3&&_a8.nodeValue)){
_a7.innerHTML="";
}
while(_a8){
_a9=_a8.nextSibling;
_a7.appendChild(_a8);
_a8=_a9;
}
}
if(_ad.length){
_ae=_ad.pop();
var _b0=doc.createElement(_ae.tagName);
if(_ae.cssText&&_b0.style){
_b0.style.cssText=_ae.cssText;
}
if(_ae.className){
_b0.className=_ae.className;
}
if(_ae.tagName==="FONT"){
if(_ae.color){
_b0.color=_ae.color;
}
if(_ae.face){
_b0.face=_ae.face;
}
if(_ae.size){
_b0.size=_ae.size;
}
}
_1.place(_b0,_a7,"before");
while(_ad.length){
_ae=_ad.pop();
var _b1=doc.createElement(_ae.tagName);
if(_ae.cssText&&_b1.style){
_b1.style.cssText=_ae.cssText;
}
if(_ae.className){
_b1.className=_ae.className;
}
if(_ae.tagName==="FONT"){
if(_ae.color){
_b1.color=_ae.color;
}
if(_ae.face){
_b1.face=_ae.face;
}
if(_ae.size){
_b1.size=_ae.size;
}
}
_b0.appendChild(_b1);
_b0=_b1;
}
_a0=doc.createTextNode(".");
_9f.appendChild(_a0);
_b0.appendChild(_a0);
_1.withGlobal(this.window,_1.hitch(this,function(){
var _b2=_2.range.create(_1.gobal);
_b2.setStart(_a0,0);
_b2.setEnd(_a0,_a0.length);
_9b.removeAllRanges();
_9b.addRange(_b2);
_2._editor.selection.collapse(false);
_a0.parentNode.innerHTML="";
}));
}else{
_9f=doc.createElement("span");
_9f.className="ieFormatBreakerSpan";
_a0=doc.createTextNode(".");
_9f.appendChild(_a0);
_1.place(_9f,_a7,"before");
_1.withGlobal(this.window,_1.hitch(this,function(){
var _b3=_2.range.create(_1.gobal);
_b3.setStart(_a0,0);
_b3.setEnd(_a0,_a0.length);
_9b.removeAllRanges();
_9b.addRange(_b3);
_2._editor.selection.collapse(false);
_a0.parentNode.innerHTML="";
}));
}
if(!_a7.firstChild){
_1.destroy(_a7);
}
return true;
}
}
return false;
}else{
_9c=_9b.getRangeAt(0);
rs=_9c.startContainer;
if(rs&&rs.nodeType===3){
_1.withGlobal(this.window,_1.hitch(this,function(){
var _b4=false;
var _b5=_9c.startOffset;
if(rs.length<_b5){
ret=this._adjustNodeAndOffset(rs,_b5);
rs=ret.node;
_b5=ret.offset;
}
txt=rs.nodeValue;
_9d=doc.createTextNode(txt.substring(0,_b5));
var _b6=txt.substring(_b5);
if(_b6!==""){
_9e=doc.createTextNode(txt.substring(_b5));
}
_9f=doc.createElement("span");
_a0=doc.createTextNode(".");
_9f.appendChild(_a0);
if(_9d.length){
_1.place(_9d,rs,"after");
}else{
_9d=rs;
}
_1.place(_9f,_9d,"after");
if(_9e){
_1.place(_9e,_9f,"after");
}
_1.destroy(rs);
var _b7=_2.range.create(_1.gobal);
_b7.setStart(_a0,0);
_b7.setEnd(_a0,_a0.length);
_9b.removeAllRanges();
_9b.addRange(_b7);
doc.execCommand(_9a);
_1.place(_9f.firstChild,_9f,"before");
_1.destroy(_9f);
_b7.setStart(_a0,0);
_b7.setEnd(_a0,_a0.length);
_9b.removeAllRanges();
_9b.addRange(_b7);
_2._editor.selection.collapse(false);
_a0.parentNode.innerHTML="";
}));
return true;
}
}
}else{
return false;
}
},_handleTextColorOrProperties:function(_b8,_b9){
var _ba=_2.range.getSelection(this.window);
var doc=this.document;
var rs,ret,_bb,txt,_bc,_bd,_be,_bf;
_b9=_b9||null;
if(_b8&&_ba&&_ba.isCollapsed){
if(_ba.rangeCount){
_bb=_ba.getRangeAt(0);
rs=_bb.startContainer;
if(rs&&rs.nodeType===3){
_1.withGlobal(this.window,_1.hitch(this,function(){
var _c0=_bb.startOffset;
if(rs.length<_c0){
ret=this._adjustNodeAndOffset(rs,_c0);
rs=ret.node;
_c0=ret.offset;
}
txt=rs.nodeValue;
_bc=doc.createTextNode(txt.substring(0,_c0));
var _c1=txt.substring(_c0);
if(_c1!==""){
_bd=doc.createTextNode(txt.substring(_c0));
}
_be=_1.create("span");
_bf=doc.createTextNode(".");
_be.appendChild(_bf);
var _c2=_1.create("span");
_be.appendChild(_c2);
if(_bc.length){
_1.place(_bc,rs,"after");
}else{
_bc=rs;
}
_1.place(_be,_bc,"after");
if(_bd){
_1.place(_bd,_be,"after");
}
_1.destroy(rs);
var _c3=_2.range.create(_1.gobal);
_c3.setStart(_bf,0);
_c3.setEnd(_bf,_bf.length);
_ba.removeAllRanges();
_ba.addRange(_c3);
if(_1.isWebKit){
var _c4="color";
if(_b8==="hilitecolor"||_b8==="backcolor"){
_c4="backgroundColor";
}
_1.style(_be,_c4,_b9);
_2._editor.selection.remove();
_1.destroy(_c2);
_be.innerHTML="&nbsp;";
_2._editor.selection.selectElement(_be);
this.focus();
}else{
this.execCommand(_b8,_b9);
_1.place(_be.firstChild,_be,"before");
_1.destroy(_be);
_c3.setStart(_bf,0);
_c3.setEnd(_bf,_bf.length);
_ba.removeAllRanges();
_ba.addRange(_c3);
_2._editor.selection.collapse(false);
_bf.parentNode.removeChild(_bf);
}
}));
return true;
}
}
}
return false;
},_adjustNodeAndOffset:function(_c5,_c6){
while(_c5.length<_c6&&_c5.nextSibling&&_c5.nextSibling.nodeType===3){
_c6=_c6-_c5.length;
_c5=_c5.nextSibling;
}
return {"node":_c5,"offset":_c6};
},_tagNamesForCommand:function(_c7){
if(_c7==="bold"){
return ["b","strong"];
}else{
if(_c7==="italic"){
return ["i","em"];
}else{
if(_c7==="strikethrough"){
return ["s","strike"];
}else{
if(_c7==="superscript"){
return ["sup"];
}else{
if(_c7==="subscript"){
return ["sub"];
}else{
if(_c7==="underline"){
return ["u"];
}
}
}
}
}
}
return [];
},_stripBreakerNodes:function(_c8){
_1.withGlobal(this.window,_1.hitch(this,function(){
var _c9=_1.query(".ieFormatBreakerSpan",_c8);
var i;
for(i=0;i<_c9.length;i++){
var b=_c9[i];
while(b.firstChild){
_1.place(b.firstChild,b,"before");
}
_1.destroy(b);
}
}));
return _c8;
}});
return _2._editor.RichText;
});
