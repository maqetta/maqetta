/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/geo/charting/widget/Legend",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/_base/html","dojo/_base/window","dijit/_Widget"],function(_1,_2,_3,_4,_5,_6){
return _1.declare("dojox.geo.charting.widget.Legend",dijit._Widget,{horizontal:true,legendBody:null,swatchSize:18,map:null,postCreate:function(){
if(!this.map){
return;
}
this.series=this.map.series;
if(!this.domNode.parentNode){
_1.byId(this.map.container).appendChild(this.domNode);
}
this.refresh();
},buildRendering:function(){
this.domNode=_1.create("table",{role:"group","class":"dojoxLegendNode"});
this.legendBody=_1.create("tbody",null,this.domNode);
this.inherited(arguments);
},refresh:function(){
while(this.legendBody.lastChild){
_1.destroy(this.legendBody.lastChild);
}
if(this.horizontal){
_1.addClass(this.domNode,"dojoxLegendHorizontal");
this._tr=_1.doc.createElement("tr");
this.legendBody.appendChild(this._tr);
}
var s=this.series;
if(s.length==0){
return;
}
_1.forEach(s,function(x){
this._addLabel(x.color,x.name);
},this);
},_addLabel:function(_7,_8){
var _9=_1.doc.createElement("td");
var _a=_1.doc.createElement("td");
var _b=_1.doc.createElement("div");
_1.addClass(_9,"dojoxLegendIcon");
_1.addClass(_a,"dojoxLegendText");
_b.style.width=this.swatchSize+"px";
_b.style.height=this.swatchSize+"px";
_9.appendChild(_b);
if(this.horizontal){
this._tr.appendChild(_9);
this._tr.appendChild(_a);
}else{
var tr=_1.doc.createElement("tr");
this.legendBody.appendChild(tr);
tr.appendChild(_9);
tr.appendChild(_a);
}
_b.style.background=_7;
_a.innerHTML=String(_8);
}});
});
