/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox","../_Plugin","./_RowMapLayer"],function(_1,_2){
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
var _13=0;
var _14=0;
var _15=Math.max(_b[_b.length-1],_c);
if(_15==_e.length){
--_15;
}
for(i=_b[0];i<=_15;++i){
var j=tmp[i];
if(j>=0){
if(i!=_c-_10+j){
_12[i]=_c-_10+j;
}
_13=j+1;
_14=_b.length-j-1;
}else{
if(i<_c&&_13>0){
_12[i]=i-_13;
}else{
if(i>=_c&&_14>0){
_12[i]=i+_14;
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
},moveRows:function(_16,_17){
var g=this.grid,_18={},_19=[],_1a=[],len=_16.length,i,r,k,arr,_1b,_1c;
for(i=0;i<len;++i){
r=_16[i];
if(r>=_17){
break;
}
_19.push(r);
}
_1a=_16.slice(i);
arr=_19;
len=arr.length;
if(len){
_1b={};
_1.forEach(arr,function(r){
_1b[r]=true;
});
_18[arr[0]]=_17-len;
for(k=0,i=arr[k]+1,_1c=i-1;i<_17;++i){
if(!_1b[i]){
_18[i]=_1c;
++_1c;
}else{
++k;
_18[i]=_17-len+k;
}
}
}
arr=_1a;
len=arr.length;
if(len){
_1b={};
_1.forEach(arr,function(r){
_1b[r]=true;
});
_18[arr[len-1]]=_17+len-1;
for(k=len-1,i=arr[k]-1,_1c=i+1;i>=_17;--i){
if(!_1b[i]){
_18[i]=_1c;
--_1c;
}else{
--k;
_18[i]=_17+k;
}
}
}
var _1d=_1.clone(_18);
g.layer("rowmap").setMapping(_18);
g.forEachLayer(function(_1e){
if(_1e.name()!="rowmap"){
_1e.invalidate();
return true;
}else{
return false;
}
},false);
g.selection.selected=[];
g._noInternalMapping=true;
g._refresh();
setTimeout(function(){
_1.publish("dojox/grid/rearrange/move/"+g.id,["row",_1d,_16]);
g._noInternalMapping=false;
},0);
},moveCells:function(_1f,_20){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
if(_1f.min.row==_20.min.row&&_1f.min.col==_20.min.col){
return;
}
var _21=g.layout.cells,cnt=_1f.max.row-_1f.min.row+1,r,c,tr,tc,_22=[],_23=[];
for(r=_1f.min.row,tr=_20.min.row;r<=_1f.max.row;++r,++tr){
for(c=_1f.min.col,tc=_20.min.col;c<=_1f.max.col;++c,++tc){
while(_21[c]&&_21[c].hidden){
++c;
}
while(_21[tc]&&_21[tc].hidden){
++tc;
}
_22.push({"r":r,"c":c});
_23.push({"r":tr,"c":tc,"v":_21[c].get(r,g._by_idx[r].item)});
}
}
if(this._hasIdentity(_22.concat(_23))){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_22,function(_24){
s.setValue(g._by_idx[_24.r].item,_21[_24.c].field,"");
});
_1.forEach(_23,function(_25){
s.setValue(g._by_idx[_25.r].item,_21[_25.c].field,_25.v);
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/move/"+g.id,["cell",{"from":_1f,"to":_20}]);
}});
}
},copyCells:function(_26,_27){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
if(_26.min.row==_27.min.row&&_26.min.col==_27.min.col){
return;
}
var _28=g.layout.cells,cnt=_26.max.row-_26.min.row+1,r,c,tr,tc,_29=[];
for(r=_26.min.row,tr=_27.min.row;r<=_26.max.row;++r,++tr){
for(c=_26.min.col,tc=_27.min.col;c<=_26.max.col;++c,++tc){
while(_28[c]&&_28[c].hidden){
++c;
}
while(_28[tc]&&_28[tc].hidden){
++tc;
}
_29.push({"r":tr,"c":tc,"v":_28[c].get(r,g._by_idx[r].item)});
}
}
if(this._hasIdentity(_29)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_29,function(_2a){
s.setValue(g._by_idx[_2a.r].item,_28[_2a.c].field,_2a.v);
});
s.save({onComplete:function(){
setTimeout(function(){
_1.publish("dojox/grid/rearrange/copy/"+g.id,["cell",{"from":_26,"to":_27}]);
},0);
}});
}
},changeCells:function(_2b,_2c,_2d){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
var _2e=_2b,_2f=g.layout.cells,_30=_2e.layout.cells,cnt=_2c.max.row-_2c.min.row+1,r,c,tr,tc,_31=[];
for(r=_2c.min.row,tr=_2d.min.row;r<=_2c.max.row;++r,++tr){
for(c=_2c.min.col,tc=_2d.min.col;c<=_2c.max.col;++c,++tc){
while(_30[c]&&_30[c].hidden){
++c;
}
while(_2f[tc]&&_2f[tc].hidden){
++tc;
}
_31.push({"r":tr,"c":tc,"v":_30[c].get(r,_2e._by_idx[r].item)});
}
}
if(this._hasIdentity(_31)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_31,function(_32){
s.setValue(g._by_idx[_32.r].item,_2f[_32.c].field,_32.v);
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/change/"+g.id,["cell",_2d]);
}});
}
},clearCells:function(_33){
var g=this.grid,s=g.store;
if(s.getFeatures()["dojo.data.api.Write"]){
var _34=g.layout.cells,cnt=_33.max.row-_33.min.row+1,r,c,_35=[];
for(r=_33.min.row;r<=_33.max.row;++r){
for(c=_33.min.col;c<=_33.max.col;++c){
while(_34[c]&&_34[c].hidden){
++c;
}
_35.push({"r":r,"c":c});
}
}
if(this._hasIdentity(_35)){
console.warn("Can not write to identity!");
return;
}
_1.forEach(_35,function(_36){
s.setValue(g._by_idx[_36.r].item,_34[_36.c].field,"");
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/change/"+g.id,["cell",_33]);
}});
}
},insertRows:function(_37,_38,_39){
try{
var g=this.grid,s=g.store,_3a=g.rowCount,_3b={},obj={idx:0},_3c=[],i,_3d=this;
var len=_38.length;
for(i=_39;i<g.rowCount;++i){
_3b[i]=i+len;
}
if(s.getFeatures()["dojo.data.api.Write"]){
if(_37){
var _3e=_37,_3f=_3e.store,_40;
for(i=0;!_40;++i){
_40=g._by_idx[i];
}
var _41=s.getAttributes(_40.item);
var _42=[];
_1.forEach(_38,function(_43,i){
var _44={};
var _45=_3e._by_idx[_43];
if(_45){
_1.forEach(_41,function(_46){
_44[_46]=_3f.getValue(_45.item,_46);
});
_44=_3d.args.setIdentifierForNewItem(_44,s,_3a+obj.idx)||_44;
try{
s.newItem(_44);
_3c.push(_39+i);
_3b[_3a+obj.idx]=_39+i;
++obj.idx;
}
catch(e){
}
}else{
_42.push(_43);
}
});
}else{
if(_38.length&&_1.isObject(_38[0])){
_1.forEach(_38,function(_47,i){
var _48=_3d.args.setIdentifierForNewItem(_47,s,_3a+obj.idx)||_47;
try{
s.newItem(_48);
_3c.push(_39+i);
_3b[_3a+obj.idx]=_39+i;
++obj.idx;
}
catch(e){
}
});
}else{
return;
}
}
g.layer("rowmap").setMapping(_3b);
s.save({onComplete:function(){
g._refresh();
setTimeout(function(){
_1.publish("dojox/grid/rearrange/insert/"+g.id,["row",_3c]);
},0);
}});
}
}
catch(e){
}
},removeRows:function(_49){
var g=this.grid;
var s=g.store;
try{
_1.forEach(_1.map(_49,function(_4a){
return g._by_idx[_4a];
}),function(row){
if(row){
s.deleteItem(row.item);
}
});
s.save({onComplete:function(){
_1.publish("dojox/grid/rearrange/remove/"+g.id,["row",_49]);
}});
}
catch(e){
}
},_getPageInfo:function(){
var _4b=this.grid.scroller,_4c=_4b.page,_4d=_4b.page,_4e=_4b.firstVisibleRow,_4f=_4b.lastVisibleRow,_50=_4b.rowsPerPage,_51=_4b.pageNodes[0],_52,_53,_54,_55=[];
_1.forEach(_51,function(_56,_57){
if(!_56){
return;
}
_54=false;
_52=_57*_50;
_53=(_57+1)*_50-1;
if(_4e>=_52&&_4e<=_53){
_4c=_57;
_54=true;
}
if(_4f>=_52&&_4f<=_53){
_4d=_57;
_54=true;
}
if(!_54&&(_52>_4f||_53<_4e)){
_55.push(_57);
}
});
return {topPage:_4c,bottomPage:_4d,invalidPages:_55};
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.Rearrange);
return _2.grid.enhanced.plugins.Rearrange;
});
