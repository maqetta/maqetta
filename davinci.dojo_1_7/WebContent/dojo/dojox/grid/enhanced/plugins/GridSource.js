/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/GridSource",["dojo","dojox","dojo/dnd/Source","./DnD"],function(_1,_2){
var _3=function(_4){
var a=_4[0];
for(var i=1;i<_4.length;++i){
a=a.concat(_4[i]);
}
return a;
};
_1.declare("dojox.grid.enhanced.plugins.GridSource",_1.dnd.Source,{accept:["grid/cells","grid/rows","grid/cols","text"],insertNodesForGrid:false,markupFactory:function(_5,_6){
return new _2.grid.enhanced.plugins.GridSource(_6,_5);
},checkAcceptance:function(_7,_8){
if(_7 instanceof _2.grid.enhanced.plugins.GridDnDSource){
if(_8[0]){
var _9=_7.getItem(_8[0].id);
if(_9&&(_1.indexOf(_9.type,"grid/rows")>=0||_1.indexOf(_9.type,"grid/cells")>=0)&&!_7.dndPlugin._allDnDItemsLoaded()){
return false;
}
}
this.sourcePlugin=_7.dndPlugin;
}
return this.inherited(arguments);
},onDraggingOver:function(){
if(this.sourcePlugin){
this.sourcePlugin._isSource=true;
}
},onDraggingOut:function(){
if(this.sourcePlugin){
this.sourcePlugin._isSource=false;
}
},onDropExternal:function(_a,_b,_c){
if(_a instanceof _2.grid.enhanced.plugins.GridDnDSource){
var _d=_1.map(_b,function(_e){
return _a.getItem(_e.id).data;
});
var _f=_a.getItem(_b[0].id);
var _10=_f.dndPlugin.grid;
var _11=_f.type[0];
var _12;
try{
switch(_11){
case "grid/cells":
_b[0].innerHTML=this.getCellContent(_10,_d[0].min,_d[0].max)||"";
this.onDropGridCells(_10,_d[0].min,_d[0].max);
break;
case "grid/rows":
_12=_3(_d);
_b[0].innerHTML=this.getRowContent(_10,_12)||"";
this.onDropGridRows(_10,_12);
break;
case "grid/cols":
_12=_3(_d);
_b[0].innerHTML=this.getColumnContent(_10,_12)||"";
this.onDropGridColumns(_10,_12);
break;
}
if(this.insertNodesForGrid){
this.selectNone();
this.insertNodes(true,[_b[0]],this.before,this.current);
}
_f.dndPlugin.onDragOut(!_c);
}
catch(e){
console.warn("GridSource.onDropExternal() error:",e);
}
}else{
this.inherited(arguments);
}
},getCellContent:function(_13,_14,_15){
},getRowContent:function(_16,_17){
},getColumnContent:function(_18,_19){
},onDropGridCells:function(_1a,_1b,_1c){
},onDropGridRows:function(_1d,_1e){
},onDropGridColumns:function(_1f,_20){
}});
return _2.grid.enhanced.plugins.GridSource;
});
