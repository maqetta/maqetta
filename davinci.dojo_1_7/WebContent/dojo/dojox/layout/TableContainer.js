//>>built
define("dojox/layout/TableContainer",["dojo/_base/kernel","dojo/_base/lang","dojo/_base/declare","dojo/dom-class","dojo/dom-construct","dojo/_base/array","dojo/dom-prop","dojo/_base/html","dijit/layout/_LayoutWidget"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){
_1.experimental("dojox.layout.TableContainer");
var _a=_3("dojox.layout.TableContainer",_9,{cols:1,labelWidth:"100",showLabels:true,orientation:"horiz",spacing:1,customClass:"",postCreate:function(){
this.inherited(arguments);
this._children=[];
this.connect(this,"set",function(_b,_c){
if(_c&&(_b=="orientation"||_b=="customClass"||_b=="cols")){
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
var _d=this.getChildren();
if(_d.length<1){
return;
}
this._initialized=true;
_4.add(this.domNode,"dijitTableLayout");
_6.forEach(_d,function(_e){
if(!_e.started&&!_e._started){
_e.startup();
}
});
this.resize();
this.layout();
},resize:function(){
_6.forEach(this.getChildren(),function(_f){
if(typeof _f.resize=="function"){
_f.resize();
}
});
},layout:function(){
if(!this._initialized){
return;
}
var _10=this.getChildren();
var _11={};
var _12=this;
function _13(_14,_15,_16){
if(_12.customClass!=""){
var _17=_12.customClass+"-"+(_15||_14.tagName.toLowerCase());
_4.add(_14,_17);
if(arguments.length>2){
_4.add(_14,_17+"-"+_16);
}
}
};
_6.forEach(this._children,_2.hitch(this,function(_18){
_11[_18.id]=_18;
}));
_6.forEach(_10,_2.hitch(this,function(_19,_1a){
if(!_11[_19.id]){
this._children.push(_19);
}
}));
var _1b=_5.create("table",{"width":"100%","class":"tableContainer-table tableContainer-table-"+this.orientation,"cellspacing":this.spacing},this.domNode);
var _1c=_5.create("tbody");
_1b.appendChild(_1c);
_13(_1b,"table",this.orientation);
var _1d=Math.floor(100/this.cols)+"%";
var _1e=_5.create("tr",{},_1c);
var _1f=(!this.showLabels||this.orientation=="horiz")?_1e:_5.create("tr",{},_1c);
var _20=this.cols*(this.showLabels?2:1);
var _21=0;
_6.forEach(this._children,_2.hitch(this,function(_22,_23){
var _24=_22.colspan||1;
if(_24>1){
_24=this.showLabels?Math.min(_20-1,_24*2-1):Math.min(_20,_24);
}
if(_21+_24-1+(this.showLabels?1:0)>=_20){
_21=0;
_1e=_5.create("tr",{},_1c);
_1f=this.orientation=="horiz"?_1e:_5.create("tr",{},_1c);
}
var _25;
if(this.showLabels){
_25=_5.create("td",{"class":"tableContainer-labelCell"},_1e);
if(_22.spanLabel){
_7.set(_25,this.orientation=="vert"?"rowspan":"colspan",2);
}else{
_13(_25,"labelCell");
var _26={"for":_22.get("id")};
var _27=_5.create("label",_26,_25);
if(Number(this.labelWidth)>-1||String(this.labelWidth).indexOf("%")>-1){
_8.style(_25,"width",String(this.labelWidth).indexOf("%")<0?this.labelWidth+"px":this.labelWidth);
}
_27.innerHTML=_22.get("label")||_22.get("title");
}
}
var _28;
if(_22.spanLabel&&_25){
_28=_25;
}else{
_28=_5.create("td",{"class":"tableContainer-valueCell"},_1f);
}
if(_24>1){
_7.set(_28,"colspan",_24);
}
_13(_28,"valueCell",_23);
_28.appendChild(_22.domNode);
_21+=_24+(this.showLabels?1:0);
}));
if(this.table){
this.table.parentNode.removeChild(this.table);
}
_6.forEach(_10,function(_29){
if(typeof _29.layout=="function"){
_29.layout();
}
});
this.table=_1b;
this.resize();
},destroyDescendants:function(_2a){
_6.forEach(this._children,function(_2b){
_2b.destroyRecursive(_2a);
});
},_setSpacingAttr:function(_2c){
this.spacing=_2c;
if(this.table){
this.table.cellspacing=Number(_2c);
}
}});
_2.extend(dijit._Widget,{label:"",title:"",spanLabel:false,colspan:1});
return _a;
});
