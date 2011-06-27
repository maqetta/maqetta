/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Rearrange",["dojo","dojox","../_Plugin","./_RowMapLayer"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.Rearrange",_2.grid.enhanced._Plugin,{name:"rearrange",constructor:function(_3,_4){
this.grid=_3;
this.setArgs(_4);
var _5=new _2.grid.enhanced.plugins._RowMapLayer(_3);
_2.grid.enhanced.plugins.wrap(_3,"_storeLayerFetch",_5);
},setArgs:function(_6){
this.args=_1.mixin(this.args||{},_6||{});
this.args.setIdentifierForNewItem=this.args.setIdentifierForNewItem||function(v){
return v;
};
},destroy:function(){
this.inherited(arguments);
this.grid.unwrap("rowmap");
},onSetStore:function(_7){
this.grid.layer("rowmap").clearMapping();
},_hasIdentity:function(_8){
var g=this.grid,s=g.store,_9=g.layout.cells;
if(s.getFeatures()["dojo.data.api.Identity"]){
if(_1.some(_8,function(_a){
return s.getIdentityAttributes(g._by_idx[_a.r].item)==_9[_a.c].field;
})){
return true;
}
}
return false;
},moveColumns:function(_b,_c){
var g=this.grid,_d=g.layout,_e=_d.cells,_f,i,_10=0,_11=true,tmp={},_12={};
_b.sort(function(a,b){
return a-b;
});
for(i=0;i<_b.length;++i){
tmp[_b[i]]=i;
if(_b[i]<_c){
++_10;
}
}
var _13=0,_14=0;
var _15=Math.max(_b[_b.length-1],_c);
if(_15==_e.length){
--_15;
}
var _16=Math.min(_b[0],_c);
for(i=_16;i<=_15;++i){
var j=tmp[i];
if(j>=0){
_12[i]=_c-_10+j;
}else{
if(i<_c){
_12[i]=_16+_13;
++_13;
}else{
if(i>=_c){
_12[i]=_c+_b.length-_10+_14;
++_14;
}
}
}
}
_10=0;
if(_c==_e.length){
--_c;
_11=false;
}
g._notRefreshSelection=true;
for(i=0;i<_b.length;++i){
_f=_b[i];
if(_f<_c){
_f-=_10;
}
++_10;
if(_f!=_c){
_d.moveColumn(_e[_f].view.idx,_e[_c].view.idx,_f,_c,_11);
_e=_d.cells;
}
if(_c<=_f){
++_c;
}
}
delete g._notRefreshSelection;
_1.publish("dojox/grid/rearrange/move/"+g.id,["col",_12,_b]);
},moveRows:function(_17,_18){
var g=this.grid,_19={},_1a=[],_1b=[],len=_17.length,i,r,k,arr,_1c,_1d;
for(i=0;i<len;++i){
r=_17[i];
if(r>=_18){
break;
}
_1a.push(r);
}
_1b=_17.slice(i);
arr=_1a;
len=arr.length;
if(len){
_1c={};
_1.forEach(arr,function(r){
_1c[r]=true;
});
_19[arr[0]]=_18-len;
for(k=0,i=arr[k]+1,_1d=i-1;i<_18;++i){
if(!_1c[i]){
_19[i]=_1d;
++_1d;
}else{
++k;
_19[i]=_18-len+k;
}
}
}
arr=_1b;
len=arr.length;
if(len){
_1c={};
_1.forEach(arr,function(r){
_1c[r]=true;
});
_19[arr[len-1]]=_18+len-1;
for(k=len-1,i=arr[k]-1,_1d=i+1;i>=_18;--i){
if(!_1c[i]){
_19[i]=_1d;
--_1d;
}else{
--k;
_19[i]=_18+k;
}
}
}
var _1e=_1.clone(_19);
g.layer("rowmap").setMapping(_19);
g.forEachLayer(function(_1f){
if(_1f.name()!="rowmap"){
_1f.invalidate();
return true;
}else{
return false;
}
},false);
g.selection.selected=[];
g._noInternalMapping=true;
g._refresh();
setTimeout(function(){
_1.publish("dojox/grid/rearrange/move/"+g.id,["row",_1e,_17]);
g._noInternalMapping=false;
},0);
},moveCells:function(_20,_21){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
if(_20.min.row==_21.min.row&&_20.min.col==_21.min.col){
return;
}
var _22=g.layout.cells,cnt=_20.max.row-_20.min.row+1,r,c,tr,tc,_23=[],_24=[];
for(r=_20.min.row,tr=_21.min.row;r<=_20.max.row;++r,++tr){
for(c=_20.min.col,tc=_21.min.col;c<=_20.max.col;++c,++tc){
while(_22[c]&&_22[c].hidden){
++c;
}
while(_22[tc]&&_22[tc].hidden){
++tc;
}
_23.push({"r":r,"c":c});
_24.push({"r":tr,"c":tc,"v":_22[c].get(r,g._by_idx[r].item)});
}
}
if(this._hasIdentity(_23.concat(_24))){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_23,function(_25){
s.setValue(g._by_idx[_25.r].item,_22[_25.c].field,"");
});
_1.forEach(_24,function(_26){
s.setValue(g._by_idx[_26.r].item,_22[_26.c].field,_26.v);
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/move/"+g.id,["cell",{"from":_20,"to":_21}]);
}});
}
},copyCells:function(_27,_28){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
if(_27.min.row==_28.min.row&&_27.min.col==_28.min.col){
return;
}
var _29=g.layout.cells,cnt=_27.max.row-_27.min.row+1,r,c,tr,tc,_2a=[];
for(r=_27.min.row,tr=_28.min.row;r<=_27.max.row;++r,++tr){
for(c=_27.min.col,tc=_28.min.col;c<=_27.max.col;++c,++tc){
while(_29[c]&&_29[c].hidden){
++c;
}
while(_29[tc]&&_29[tc].hidden){
++tc;
}
_2a.push({"r":tr,"c":tc,"v":_29[c].get(r,g._by_idx[r].item)});
}
}
if(this._hasIdentity(_2a)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_2a,function(_2b){
s.setValue(g._by_idx[_2b.r].item,_29[_2b.c].field,_2b.v);
});
s.save({onComplete:function(){
setTimeout(function(){
_1.publish("dojox/grid/rearrange/copy/"+g.id,["cell",{"from":_27,"to":_28}]);
},0);
}});
}
},changeCells:function(_2c,_2d,_2e){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
var _2f=_2c,_30=g.layout.cells,_31=_2f.layout.cells,cnt=_2d.max.row-_2d.min.row+1,r,c,tr,tc,_32=[];
for(r=_2d.min.row,tr=_2e.min.row;r<=_2d.max.row;++r,++tr){
for(c=_2d.min.col,tc=_2e.min.col;c<=_2d.max.col;++c,++tc){
while(_31[c]&&_31[c].hidden){
++c;
}
while(_30[tc]&&_30[tc].hidden){
++tc;
}
_32.push({"r":tr,"c":tc,"v":_31[c].get(r,_2f._by_idx[r].item)});
}
}
if(this._hasIdentity(_32)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_32,function(_33){
s.setValue(g._by_idx[_33.r].item,_30[_33.c].field,_33.v);
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/change/"+g.id,["cell",_2e]);
}});
}
},clearCells:function(_34){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
var _35=g.layout.cells,cnt=_34.max.row-_34.min.row+1,r,c,_36=[];
for(r=_34.min.row;r<=_34.max.row;++r){
for(c=_34.min.col;c<=_34.max.col;++c){
while(_35[c]&&_35[c].hidden){
++c;
}
_36.push({"r":r,"c":c});
}
}
if(this._hasIdentity(_36)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_36,function(_37){
s.setValue(g._by_idx[_37.r].item,_35[_37.c].field,"");
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/change/"+g.id,["cell",_34]);
}});
}
},insertRows:function(_38,_39,_3a){
try{
var g=this.grid,s=g.store,_3b=g.rowCount,_3c={},obj={idx:0},_3d=[],i,_3e=_3a<0;
_this=this;
var len=_39.length;
if(_3e){
_3a=0;
}else{
for(i=_3a;i<g.rowCount;++i){
_3c[i]=i+len;
}
}
if(s.getFeatures()["dojo.data.api.Write"]){
if(_38){
var _3f=_38,_40=_3f.store,_41,_42;
if(!_3e){
for(i=0;!_41;++i){
_41=g._by_idx[i];
}
_42=s.getAttributes(_41.item);
}else{
_42=_1.map(g.layout.cells,function(_43){
return _43.field;
});
}
var _44=[];
_1.forEach(_39,function(_45,i){
var _46={};
var _47=_3f._by_idx[_45];
if(_47){
_1.forEach(_42,function(_48){
_46[_48]=_40.getValue(_47.item,_48);
});
_46=_this.args.setIdentifierForNewItem(_46,s,_3b+obj.idx)||_46;
try{
s.newItem(_46);
_3d.push(_3a+i);
_3c[_3b+obj.idx]=_3a+i;
++obj.idx;
}
catch(e){
}
}else{
_44.push(_45);
}
});
}else{
if(_39.length&&_1.isObject(_39[0])){
_1.forEach(_39,function(_49,i){
var _4a=_this.args.setIdentifierForNewItem(_49,s,_3b+obj.idx)||_49;
try{
s.newItem(_4a);
_3d.push(_3a+i);
_3c[_3b+obj.idx]=_3a+i;
++obj.idx;
}
catch(e){
}
});
}else{
return;
}
}
g.layer("rowmap").setMapping(_3c);
s.save({onComplete:function(){
g._refresh();
setTimeout(function(){
_1.publish("dojox/grid/rearrange/insert/"+g.id,["row",_3d]);
},0);
}});
}
}
catch(e){
}
},removeRows:function(_4b){
var g=this.grid;
var s=g.store;
try{
_1.forEach(_1.map(_4b,function(_4c){
return g._by_idx[_4c];
}),function(row){
if(row){
s.deleteItem(row.item);
}
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/remove/"+g.id,["row",_4b]);
}});
}
catch(e){
}
},_getPageInfo:function(){
var _4d=this.grid.scroller,_4e=_4d.page,_4f=_4d.page,_50=_4d.firstVisibleRow,_51=_4d.lastVisibleRow,_52=_4d.rowsPerPage,_53=_4d.pageNodes[0],_54,_55,_56,_57=[];
_1.forEach(_53,function(_58,_59){
if(!_58){
return;
}
_56=false;
_54=_59*_52;
_55=(_59+1)*_52-1;
if(_50>=_54&&_50<=_55){
_4e=_59;
_56=true;
}
if(_51>=_54&&_51<=_55){
_4f=_59;
_56=true;
}
if(!_56&&(_54>_51||_55<_50)){
_57.push(_59);
}
});
return {topPage:_4e,bottomPage:_4f,invalidPages:_57};
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.Rearrange);
return _2.grid.enhanced.plugins.Rearrange;
});
