/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/FixedSplitter",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/lang","dojo/_base/array","dijit/_WidgetBase","dijit/_Container","dijit/_Contained","./FixedSplitterPane"],function(_1,_2,_3,_4,_5,_6,_7,_8){
return _1.declare("dojox.mobile.FixedSplitter",[dijit._WidgetBase,dijit._Container,dijit._Contained],{orientation:"H",isContainer:true,buildRendering:function(){
this.domNode=this.containerNode=this.srcNodeRef?this.srcNodeRef:_1.doc.createElement("DIV");
_1.addClass(this.domNode,"mblFixedSpliter");
},startup:function(){
if(this._started){
return;
}
var _9=_1.filter(this.domNode.childNodes,function(_a){
return _a.nodeType==1;
});
_1.forEach(_9,function(_b){
_1.addClass(_b,"mblFixedSplitterPane"+this.orientation);
},this);
this.inherited(arguments);
var _c=this;
setTimeout(function(){
var _d=_c.getParent&&_c.getParent();
if(!_d||!_d.resize){
_c.resize();
}
},0);
},resize:function(){
this.layout();
},layout:function(){
var sz=this.orientation=="H"?"w":"h";
var _e=_1.filter(this.domNode.childNodes,function(_f){
return _f.nodeType==1;
});
var _10=0;
for(var i=0;i<_e.length;i++){
_1.marginBox(_e[i],this.orientation=="H"?{l:_10}:{t:_10});
if(i<_e.length-1){
_10+=_1.marginBox(_e[i])[sz];
}
}
var h;
if(this.orientation=="V"){
if(this.domNode.parentNode.tagName=="BODY"){
if(_1.filter(_1.body().childNodes,function(_11){
return _11.nodeType==1;
}).length==1){
h=(_1.global.innerHeight||_1.doc.documentElement.clientHeight);
}
}
}
var l=(h||_1.marginBox(this.domNode)[sz])-_10;
var _12={};
_12[sz]=l;
_1.marginBox(_e[_e.length-1],_12);
_1.forEach(this.getChildren(),function(_13){
if(_13.resize){
_13.resize();
}
});
}});
});
