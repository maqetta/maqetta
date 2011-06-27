/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/dtl/_Templated",["dojo/_base/kernel","dojo/_base/declare","./_base","dijit/_Templated","dojo/_base/html"],function(_1,_2,dd,dt){
return _1.declare("dojox.dtl._Templated",dt,{_dijitTemplateCompat:false,buildRendering:function(){
var _3;
if(this.domNode&&!this._template){
return;
}
if(!this._template){
var t=this.getCachedTemplate(this.templatePath,this.templateString,this._skipNodeCache);
if(t instanceof dd.Template){
this._template=t;
}else{
_3=t;
}
}
if(!_3){
var _4=new dd._Context(this);
if(!this._created){
delete _4._getter;
}
var _5=_1._toDom(this._template.render(_4));
if(_5.nodeType!==1&&_5.nodeType!==3){
for(var i=0,l=_5.childNodes.length;i<l;++i){
_3=_5.childNodes[i];
if(_3.nodeType==1){
break;
}
}
}else{
_3=_5;
}
}
this._attachTemplateNodes(_3);
if(this.widgetsInTemplate){
var _6=_1.parser,_7,_8;
if(_6._query!="[dojoType]"){
_7=_6._query;
_8=_6._attrName;
_6._query="[dojoType]";
_6._attrName="dojoType";
}
var cw=(this._startupWidgets=_1.parser.parse(_3,{noStart:!this._earlyTemplatedStartup,inherited:{dir:this.dir,lang:this.lang}}));
if(_7){
_6._query=_7;
_6._attrName=_8;
}
this._supportingWidgets=dijit.findWidgets(_3);
this._attachTemplateNodes(cw,function(n,p){
return n[p];
});
}
if(this.domNode){
_1.place(_3,this.domNode,"before");
this.destroyDescendants();
_1.destroy(this.domNode);
}
this.domNode=_3;
this._fillContent(this.srcNodeRef);
},_templateCache:{},getCachedTemplate:function(_9,_a,_b){
var _c=this._templateCache;
var _d=_a||_9;
if(_c[_d]){
return _c[_d];
}
_a=_1.string.trim(_a||_1.cache(_9,{sanitize:true}));
if(this._dijitTemplateCompat&&(_b||_a.match(/\$\{([^\}]+)\}/g))){
_a=this._stringRepl(_a);
}
if(_b||!_a.match(/\{[{%]([^\}]+)[%}]\}/g)){
return _c[_d]=_1._toDom(_a);
}else{
return _c[_d]=new dd.Template(_a);
}
},render:function(){
this.buildRendering();
},startup:function(){
_1.forEach(this._startupWidgets,function(w){
if(w&&!w._started&&w.startup){
w.startup();
}
});
this.inherited(arguments);
}});
});
