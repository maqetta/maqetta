/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/layout/ContentPane",["dojo/_base/kernel","..","../_Widget","./_ContentPaneResizeMixin","dojo/string","dojo/html","dojo/i18n!../nls/loading","dojo/_base/Deferred","dojo/_base/array","dojo/_base/html","dojo/_base/lang","dojo/_base/window","dojo/_base/xhr","dojo/i18n"],function(_1,_2){
_1.declare("dijit.layout.ContentPane",[_2._Widget,_2.layout._ContentPaneResizeMixin],{href:"",content:"",extractContent:false,parseOnLoad:true,parserScope:_1._scopeName,preventCache:false,preload:false,refreshOnShow:false,loadingMessage:"<span class='dijitContentPaneLoading'><span class='dijitInline dijitIconLoading'></span>${loadingState}</span>",errorMessage:"<span class='dijitContentPaneError'><span class='dijitInline dijitIconError'></span>${errorState}</span>",isLoaded:false,baseClass:"dijitContentPane",ioArgs:{},onLoadDeferred:null,_setTitleAttr:null,stopParser:true,template:false,create:function(_3,_4){
if((!_3||!_3.template)&&_4&&!("href" in _3)&&!("content" in _3)){
var df=_1.doc.createDocumentFragment();
_4=_1.byId(_4);
while(_4.firstChild){
df.appendChild(_4.firstChild);
}
_3=_1.delegate(_3,{content:df});
}
this.inherited(arguments,[_3,_4]);
},postMixInProperties:function(){
this.inherited(arguments);
var _5=_1.i18n.getLocalization("dijit","loading",this.lang);
this.loadingMessage=_1.string.substitute(this.loadingMessage,_5);
this.errorMessage=_1.string.substitute(this.errorMessage,_5);
},buildRendering:function(){
this.inherited(arguments);
if(!this.containerNode){
this.containerNode=this.domNode;
}
this.domNode.title="";
if(!_1.attr(this.domNode,"role")){
this.domNode.setAttribute("role","group");
}
},_startChildren:function(){
this.inherited(arguments);
if(this._contentSetter){
_1.forEach(this._contentSetter.parseResults,function(_6){
if(!_6._started&&!_6._destroyed&&_1.isFunction(_6.startup)){
_6.startup();
_6._started=true;
}
},this);
}
},setHref:function(_7){
_1.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use set('href', ...) instead.","","2.0");
return this.set("href",_7);
},_setHrefAttr:function(_8){
this.cancel();
this.onLoadDeferred=new _1.Deferred(_1.hitch(this,"cancel"));
this.onLoadDeferred.addCallback(_1.hitch(this,"onLoad"));
this._set("href",_8);
if(this.preload||(this._created&&this._isShown())){
this._load();
}else{
this._hrefChanged=true;
}
return this.onLoadDeferred;
},setContent:function(_9){
_1.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use set('content', ...) instead.","","2.0");
this.set("content",_9);
},_setContentAttr:function(_a){
this._set("href","");
this.cancel();
this.onLoadDeferred=new _1.Deferred(_1.hitch(this,"cancel"));
if(this._created){
this.onLoadDeferred.addCallback(_1.hitch(this,"onLoad"));
}
this._setContent(_a||"");
this._isDownloaded=false;
return this.onLoadDeferred;
},_getContentAttr:function(){
return this.containerNode.innerHTML;
},cancel:function(){
if(this._xhrDfd&&(this._xhrDfd.fired==-1)){
this._xhrDfd.cancel();
}
delete this._xhrDfd;
this.onLoadDeferred=null;
},uninitialize:function(){
if(this._beingDestroyed){
this.cancel();
}
this.inherited(arguments);
},destroyRecursive:function(_b){
if(this._beingDestroyed){
return;
}
this.inherited(arguments);
},_onShow:function(){
this.inherited(arguments);
if(this.href){
if(!this._xhrDfd&&(!this.isLoaded||this._hrefChanged||this.refreshOnShow)){
return this.refresh();
}
}
},refresh:function(){
this.cancel();
this.onLoadDeferred=new _1.Deferred(_1.hitch(this,"cancel"));
this.onLoadDeferred.addCallback(_1.hitch(this,"onLoad"));
this._load();
return this.onLoadDeferred;
},_load:function(){
this._setContent(this.onDownloadStart(),true);
var _c=this;
var _d={preventCache:(this.preventCache||this.refreshOnShow),url:this.href,handleAs:"text"};
if(_1.isObject(this.ioArgs)){
_1.mixin(_d,this.ioArgs);
}
var _e=(this._xhrDfd=(this.ioMethod||_1.xhrGet)(_d));
_e.addCallback(function(_f){
try{
_c._isDownloaded=true;
_c._setContent(_f,false);
_c.onDownloadEnd();
}
catch(err){
_c._onError("Content",err);
}
delete _c._xhrDfd;
return _f;
});
_e.addErrback(function(err){
if(!_e.canceled){
_c._onError("Download",err);
}
delete _c._xhrDfd;
return err;
});
delete this._hrefChanged;
},_onLoadHandler:function(_10){
this._set("isLoaded",true);
try{
this.onLoadDeferred.callback(_10);
}
catch(e){
console.error("Error "+this.widgetId+" running custom onLoad code: "+e.message);
}
},_onUnloadHandler:function(){
this._set("isLoaded",false);
try{
this.onUnload();
}
catch(e){
console.error("Error "+this.widgetId+" running custom onUnload code: "+e.message);
}
},destroyDescendants:function(){
if(this.isLoaded){
this._onUnloadHandler();
}
var _11=this._contentSetter;
_1.forEach(this.getChildren(),function(_12){
if(_12.destroyRecursive){
_12.destroyRecursive();
}
});
if(_11){
_1.forEach(_11.parseResults,function(_13){
if(_13.destroyRecursive&&_13.domNode&&_13.domNode.parentNode==_1.body()){
_13.destroyRecursive();
}
});
delete _11.parseResults;
}
_1.html._emptyNode(this.containerNode);
delete this._singleChild;
},_setContent:function(_14,_15){
this.destroyDescendants();
var _16=this._contentSetter;
if(!(_16&&_16 instanceof _1.html._ContentSetter)){
_16=this._contentSetter=new _1.html._ContentSetter({node:this.containerNode,_onError:_1.hitch(this,this._onError),onContentError:_1.hitch(this,function(e){
var _17=this.onContentError(e);
try{
this.containerNode.innerHTML=_17;
}
catch(e){
console.error("Fatal "+this.id+" could not change content due to "+e.message,e);
}
})});
}
var _18=_1.mixin({cleanContent:this.cleanContent,extractContent:this.extractContent,parseContent:!_14.domNode&&this.parseOnLoad,parserScope:this.parserScope,startup:false,dir:this.dir,lang:this.lang,textDir:this.textDir},this._contentSetterParams||{});
_16.set((_1.isObject(_14)&&_14.domNode)?_14.domNode:_14,_18);
delete this._contentSetterParams;
if(this.doLayout){
this._checkIfSingleChild();
}
if(!_15){
if(this._started){
this._startChildren();
this._scheduleLayout();
}
this._onLoadHandler(_14);
}
},_onError:function(_19,err,_1a){
this.onLoadDeferred.errback(err);
var _1b=this["on"+_19+"Error"].call(this,err);
if(_1a){
console.error(_1a,err);
}else{
if(_1b){
this._setContent(_1b,true);
}
}
},onLoad:function(_1c){
},onUnload:function(){
},onDownloadStart:function(){
return this.loadingMessage;
},onContentError:function(_1d){
},onDownloadError:function(_1e){
return this.errorMessage;
},onDownloadEnd:function(){
}});
return _2.layout.ContentPane;
});
