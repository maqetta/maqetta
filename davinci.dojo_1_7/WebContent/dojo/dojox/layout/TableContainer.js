/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/layout/TableContainer",["dojo","dijit","dojox","dijit/layout/_LayoutWidget"],function(_1,_2,_3){
_1.getObject("dojox.layout.TableContainer",1);
_1.experimental("dojox.layout.TableContainer");
_1.declare("dojox.layout.TableContainer",_2.layout._LayoutWidget,{cols:1,labelWidth:"100",showLabels:true,orientation:"horiz",spacing:1,customClass:"",postCreate:function(){
this.inherited(arguments);
this._children=[];
this.connect(this,"set",function(_4,_5){
if(_5&&(_4=="orientation"||_4=="customClass"||_4=="cols")){
this.layout();
}
});
},startup:function(){
if(this._started){
return;
}
this.inherited(arguments);
if(this._initialized){
return;
}
var _6=this.getChildren();
if(_6.length<1){
return;
}
this._initialized=true;
_1.addClass(this.domNode,"dijitTableLayout");
_1.forEach(_6,function(_7){
if(!_7.started&&!_7._started){
_7.startup();
}
});
this.resize();
this.layout();
},resize:function(){
_1.forEach(this.getChildren(),function(_8){
if(typeof _8.resize=="function"){
_8.resize();
}
});
},layout:function(){
if(!this._initialized){
return;
}
var _9=this.getChildren();
var _a={};
var _b=this;
function _c(_d,_e,_f){
if(_b.customClass!=""){
var _10=_b.customClass+"-"+(_e||_d.tagName.toLowerCase());
_1.addClass(_d,_10);
if(arguments.length>2){
_1.addClass(_d,_10+"-"+_f);
}
}
};
_1.forEach(this._children,_1.hitch(this,function(_11){
_a[_11.id]=_11;
}));
_1.forEach(_9,_1.hitch(this,function(_12,_13){
if(!_a[_12.id]){
this._children.push(_12);
}
}));
var _14=_1.create("table",{"width":"100%","class":"tableContainer-table tableContainer-table-"+this.orientation,"cellspacing":this.spacing},this.domNode);
var _15=_1.create("tbody");
_14.appendChild(_15);
_c(_14,"table",this.orientation);
var _16=Math.floor(100/this.cols)+"%";
var _17=_1.create("tr",{},_15);
var _18=(!this.showLabels||this.orientation=="horiz")?_17:_1.create("tr",{},_15);
var _19=this.cols*(this.showLabels?2:1);
var _1a=0;
_1.forEach(this._children,_1.hitch(this,function(_1b,_1c){
var _1d=_1b.colspan||1;
if(_1d>1){
_1d=this.showLabels?Math.min(_19-1,_1d*2-1):Math.min(_19,_1d);
}
if(_1a+_1d-1+(this.showLabels?1:0)>=_19){
_1a=0;
_17=_1.create("tr",{},_15);
_18=this.orientation=="horiz"?_17:_1.create("tr",{},_15);
}
var _1e;
if(this.showLabels){
_1e=_1.create("td",{"class":"tableContainer-labelCell"},_17);
if(_1b.spanLabel){
_1.attr(_1e,this.orientation=="vert"?"rowspan":"colspan",2);
}else{
_c(_1e,"labelCell");
var _1f={"for":_1b.get("id")};
var _20=_1.create("label",_1f,_1e);
if(Number(this.labelWidth)>-1||String(this.labelWidth).indexOf("%")>-1){
_1.style(_1e,"width",String(this.labelWidth).indexOf("%")<0?this.labelWidth+"px":this.labelWidth);
}
_20.innerHTML=_1b.get("label")||_1b.get("title");
}
}
var _21;
if(_1b.spanLabel&&_1e){
_21=_1e;
}else{
_21=_1.create("td",{"class":"tableContainer-valueCell"},_18);
}
if(_1d>1){
_1.attr(_21,"colspan",_1d);
}
_c(_21,"valueCell",_1c);
_21.appendChild(_1b.domNode);
_1a+=_1d+(this.showLabels?1:0);
}));
if(this.table){
this.table.parentNode.removeChild(this.table);
}
_1.forEach(_9,function(_22){
if(typeof _22.layout=="function"){
_22.layout();
}
});
this.table=_14;
this.resize();
},destroyDescendants:function(_23){
_1.forEach(this._children,function(_24){
_24.destroyRecursive(_23);
});
},_setSpacingAttr:function(_25){
this.spacing=_25;
if(this.table){
this.table.cellspacing=Number(_25);
}
}});
_1.extend(_2._Widget,{label:"",title:"",spanLabel:false,colspan:1});
return _1.getObject("dojox.layout.TableContainer");
});
require(["dojox/layout/TableContainer"]);
