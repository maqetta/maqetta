/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/PageIndicator",["dojo/_base/kernel","dojo/_base/declare","dojo/_base/html","dojo/_base/array","dojo/_base/lang","dijit/_WidgetBase","dijit/_Contained"],function(_1,_2,_3,_4,_5,_6,_7){
return _1.declare("dojox.mobile.PageIndicator",[dijit._WidgetBase,dijit._Contained],{refId:"",buildRendering:function(){
this.domNode=this.srcNodeRef||_1.doc.createElement("DIV");
this.domNode.className="mblPageIndicator";
this._tblNode=_1.create("TABLE",{className:"mblPageIndicatorContainer"},this.domNode);
this._tblNode.insertRow(-1);
this.connect(this.domNode,"onclick","onClick");
_1.subscribe("/dojox/mobile/viewChanged",this,function(_8){
this.reset();
});
},startup:function(){
var _9=this;
setTimeout(function(){
_9.reset();
},0);
},reset:function(){
var r=this._tblNode.rows[0];
var i,c,a=[],_a;
var _b=(this.refId&&_1.byId(this.refId))||this.domNode;
var _c=_b.parentNode.childNodes;
for(i=0;i<_c.length;i++){
c=_c[i];
if(this.isView(c)){
a.push(c);
}
}
if(r.cells.length!==a.length){
_1.empty(r);
for(i=0;i<a.length;i++){
c=a[i];
_a=_1.create("DIV",{className:"mblPageIndicatorDot"});
r.insertCell(-1).appendChild(_a);
}
}
if(a.length===0){
return;
}
var _d=dijit.byNode(a[0]).getShowingView();
for(i=0;i<r.cells.length;i++){
_a=r.cells[i].firstChild;
if(a[i]===_d.domNode){
_1.addClass(_a,"mblPageIndicatorDotSelected");
}else{
_1.removeClass(_a,"mblPageIndicatorDotSelected");
}
}
},isView:function(_e){
return (_e&&_e.nodeType===1&&_1.hasClass(_e,"mblView"));
},onClick:function(e){
if(e.target!==this.domNode){
return;
}
if(e.layerX<this._tblNode.offsetLeft){
_1.publish("/dojox/mobile/prevPage",[this]);
}else{
if(e.layerX>this._tblNode.offsetLeft+this._tblNode.offsetWidth){
_1.publish("/dojox/mobile/nextPage",[this]);
}
}
}});
});
