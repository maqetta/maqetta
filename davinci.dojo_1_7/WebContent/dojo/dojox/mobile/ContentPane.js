/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/ContentPane",["dojo/_base/kernel","dojo/_base/declare","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","dojo/_base/xhr","./ProgressIndicator"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.ContentPane",[dijit._WidgetBase,dijit._Container,dijit._Contained],{href:"",content:"",parseOnLoad:true,prog:true,startup:function(){
if(this._started){
return;
}
if(this.prog){
this._p=dojox.mobile.ProgressIndicator.getInstance();
}
if(this.href){
this.set("href",this.href);
}else{
if(this.content){
this.set("content",this.content);
}
}
var _8=this.getParent&&this.getParent();
if(!_8||!_8.resize){
this.resize();
}
this.inherited(arguments);
},resize:function(){
_1.forEach(this.getChildren(),function(_9){
if(_9.resize){
_9.resize();
}
});
},loadHandler:function(_a){
this.set("content",_a);
},errorHandler:function(_b){
if(p){
p.stop();
}
},onLoad:function(){
},_setHrefAttr:function(_c){
var p=this._p;
if(p){
_1.body().appendChild(p.domNode);
p.start();
}
this.href=_c;
_1.xhrGet({url:_c,handleAs:"text",load:_1.hitch(this,"loadHandler"),error:_1.hitch(this,"errorHandler")});
},_setContentAttr:function(_d){
this.destroyDescendants();
if(typeof _d==="object"){
this.domNode.appendChild(_d);
}else{
this.domNode.innerHTML=_d;
}
if(this.parseOnLoad){
_1.parser.parse(this.domNode);
}
if(this._p){
this._p.stop();
}
this.onLoad();
}});
});
