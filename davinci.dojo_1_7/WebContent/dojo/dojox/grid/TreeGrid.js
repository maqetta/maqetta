/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/TreeGrid",["dojo","dijit","dojox","./DataGrid","./_TreeView","./cells/tree","./TreeSelection"],function(_1,_2,_3){
_1.experimental("dojox.grid.TreeGrid");
_1.declare("dojox.grid._TreeAggregator",null,{cells:[],grid:null,childFields:[],constructor:function(_4){
this.cells=_4.cells||[];
this.childFields=_4.childFields||[];
this.grid=_4.grid;
this.store=this.grid.store;
},_cacheValue:function(_5,id,_6){
_5[id]=_6;
return _6;
},clearSubtotalCache:function(){
if(this.store){
delete this.store._cachedAggregates;
}
},cnt:function(_7,_8,_9){
var _a=0;
var _b=this.store;
var _c=this.childFields;
if(_c[_8]){
var _d=_b.getValues(_9,_c[_8]);
if(_7.index<=_8+1){
_a=_d.length;
}else{
_1.forEach(_d,function(c){
_a+=this.getForCell(_7,_8+1,c,"cnt");
},this);
}
}else{
_a=1;
}
return _a;
},sum:function(_e,_f,_10){
var _11=0;
var _12=this.store;
var _13=this.childFields;
if(_13[_f]){
_1.forEach(_12.getValues(_10,_13[_f]),function(c){
_11+=this.getForCell(_e,_f+1,c,"sum");
},this);
}else{
_11+=_12.getValue(_10,_e.field);
}
return _11;
},value:function(_14,_15,_16){
},getForCell:function(_17,_18,_19,_1a){
var _1b=this.store;
if(!_1b||!_19||!_1b.isItem(_19)){
return "";
}
var _1c=_1b._cachedAggregates=_1b._cachedAggregates||{};
var id=_1b.getIdentity(_19);
var _1d=_1c[id]=_1c[id]||[];
if(!_17.getOpenState){
_17=this.grid.getCell(_17.layoutIndex+_18+1);
}
var idx=_17.index;
var _1e=_1d[idx]=_1d[idx]||{};
_1a=(_1a||(_17.parentCell?_17.parentCell.aggregate:"sum"))||"sum";
var _1f=_17.field;
if(_1f==_1b.getLabelAttributes()[0]){
_1a="cnt";
}
var _20=_1e[_1a]=_1e[_1a]||[];
if(_20[_18]!=undefined){
return _20[_18];
}
var _21=((_17.parentCell&&_17.parentCell.itemAggregates)?_17.parentCell.itemAggregates[_17.idxInParent]:"")||"";
if(_21&&_1b.hasAttribute(_19,_21)){
return this._cacheValue(_20,_18,_1b.getValue(_19,_21));
}else{
if(_21){
return this._cacheValue(_20,_18,0);
}
}
return this._cacheValue(_20,_18,this[_1a](_17,_18,_19));
}});
_1.declare("dojox.grid._TreeLayout",_3.grid._Layout,{_isCollapsable:false,_getInternalStructure:function(_22){
var g=this.grid;
var s=_22;
var _23=s[0].cells[0];
var _24={type:"dojox.grid._TreeView",cells:[[]]};
var _25=[];
var _26=0;
var _27=function(_28,_29){
var _2a=_28.children;
var _2b=function(_2c,idx){
var k,n={};
for(k in _2c){
n[k]=_2c[k];
}
n=_1.mixin(n,{level:_29,idxInParent:_29>0?idx:-1,parentCell:_29>0?_28:null});
return n;
};
var ret=[];
_1.forEach(_2a,function(c,idx){
if("children" in c){
_25.push(c.field);
var _2d=ret[ret.length-1];
_2d.isCollapsable=true;
c.level=_29;
ret=ret.concat(_27(c,_29+1));
}else{
ret.push(_2b(c,idx));
}
});
_26=Math.max(_26,_29);
return ret;
};
var _2e={children:_23,itemAggregates:[]};
_24.cells[0]=_27(_2e,0);
g.aggregator=new _3.grid._TreeAggregator({cells:_24.cells[0],grid:g,childFields:_25});
if(g.scroller&&g.defaultOpen){
g.scroller.defaultRowHeight=g.scroller._origDefaultRowHeight*(2*_26+1);
}
return [_24];
},setStructure:function(_2f){
var s=_2f;
var g=this.grid;
if(g&&g.treeModel&&!_1.every(s,function(i){
return ("cells" in i);
})){
s=arguments[0]=[{cells:[s]}];
}
if(s.length==1&&s[0].cells.length==1){
if(g&&g.treeModel){
s[0].type="dojox.grid._TreeView";
this._isCollapsable=true;
s[0].cells[0][(this.grid.treeModel?this.grid.expandoCell:0)].isCollapsable=true;
}else{
var _30=_1.filter(s[0].cells[0],function(c){
return ("children" in c);
});
if(_30.length===1){
this._isCollapsable=true;
}
}
}
if(this._isCollapsable&&(!g||!g.treeModel)){
arguments[0]=this._getInternalStructure(s);
}
this.inherited(arguments);
},addCellDef:function(_31,_32,_33){
var obj=this.inherited(arguments);
return _1.mixin(obj,_3.grid.cells.TreeCell);
}});
_1.declare("dojox.grid.TreePath",null,{level:0,_str:"",_arr:null,grid:null,store:null,cell:null,item:null,constructor:function(_34,_35){
if(_1.isString(_34)){
this._str=_34;
this._arr=_1.map(_34.split("/"),function(_36){
return parseInt(_36,10);
});
}else{
if(_1.isArray(_34)){
this._str=_34.join("/");
this._arr=_34.slice(0);
}else{
if(typeof _34=="number"){
this._str=String(_34);
this._arr=[_34];
}else{
this._str=_34._str;
this._arr=_34._arr.slice(0);
}
}
}
this.level=this._arr.length-1;
this.grid=_35;
this.store=this.grid.store;
if(_35.treeModel){
this.cell=_35.layout.cells[_35.expandoCell];
}else{
this.cell=_35.layout.cells[this.level];
}
},item:function(){
if(!this._item){
this._item=this.grid.getItem(this._arr);
}
return this._item;
},compare:function(_37){
if(_1.isString(_37)||_1.isArray(_37)){
if(this._str==_37){
return 0;
}
if(_37.join&&this._str==_37.join("/")){
return 0;
}
_37=new _3.grid.TreePath(_37,this.grid);
}else{
if(_37 instanceof _3.grid.TreePath){
if(this._str==_37._str){
return 0;
}
}
}
for(var i=0,l=(this._arr.length<_37._arr.length?this._arr.length:_37._arr.length);i<l;i++){
if(this._arr[i]<_37._arr[i]){
return -1;
}
if(this._arr[i]>_37._arr[i]){
return 1;
}
}
if(this._arr.length<_37._arr.length){
return -1;
}
if(this._arr.length>_37._arr.length){
return 1;
}
return 0;
},isOpen:function(){
return this.cell.openStates&&this.cell.getOpenState(this.item());
},previous:function(){
var _38=this._arr.slice(0);
if(this._str=="0"){
return null;
}
var _39=_38.length-1;
if(_38[_39]===0){
_38.pop();
return new _3.grid.TreePath(_38,this.grid);
}
_38[_39]--;
var _3a=new _3.grid.TreePath(_38,this.grid);
return _3a.lastChild(true);
},next:function(){
var _3b=this._arr.slice(0);
if(this.isOpen()){
_3b.push(0);
}else{
_3b[_3b.length-1]++;
for(var i=this.level;i>=0;i--){
var _3c=this.grid.getItem(_3b.slice(0,i+1));
if(i>0){
if(!_3c){
_3b.pop();
_3b[i-1]++;
}
}else{
if(!_3c){
return null;
}
}
}
}
return new _3.grid.TreePath(_3b,this.grid);
},children:function(_3d){
if(!this.isOpen()&&!_3d){
return null;
}
var _3e=[];
var _3f=this.grid.treeModel;
if(_3f){
var _40=this.item();
var _41=_3f.store;
if(!_3f.mayHaveChildren(_40)){
return null;
}
_1.forEach(_3f.childrenAttrs,function(_42){
_3e=_3e.concat(_41.getValues(_40,_42));
});
}else{
_3e=this.store.getValues(this.item(),this.grid.layout.cells[this.cell.level+1].parentCell.field);
if(_3e.length>1&&this.grid.sortChildItems){
var _43=this.grid.getSortProps();
if(_43&&_43.length){
var _44=_43[0].attribute,_45=this.grid;
if(_44&&_3e[0][_44]){
var _46=!!_43[0].descending;
_3e=_3e.slice(0);
_3e.sort(function(a,b){
return _45._childItemSorter(a,b,_44,_46);
});
}
}
}
}
return _3e;
},childPaths:function(){
var _47=this.children();
if(!_47){
return [];
}
return _1.map(_47,function(_48,_49){
return new _3.grid.TreePath(this._str+"/"+_49,this.grid);
},this);
},parent:function(){
if(this.level===0){
return null;
}
return new _3.grid.TreePath(this._arr.slice(0,this.level),this.grid);
},lastChild:function(_4a){
var _4b=this.children();
if(!_4b||!_4b.length){
return this;
}
var _4c=new _3.grid.TreePath(this._str+"/"+String(_4b.length-1),this.grid);
if(!_4a){
return _4c;
}
return _4c.lastChild(true);
},toString:function(){
return this._str;
}});
_1.declare("dojox.grid._TreeFocusManager",_3.grid._FocusManager,{setFocusCell:function(_4d,_4e){
if(_4d&&_4d.getNode(_4e)){
this.inherited(arguments);
}
},isLastFocusCell:function(){
if(this.cell&&this.cell.index==this.grid.layout.cellCount-1){
var _4f=new _3.grid.TreePath(this.grid.rowCount-1,this.grid);
_4f=_4f.lastChild(true);
return this.rowIndex==_4f._str;
}
return false;
},next:function(){
if(this.cell){
var row=this.rowIndex,col=this.cell.index+1,cc=this.grid.layout.cellCount-1;
var _50=new _3.grid.TreePath(this.rowIndex,this.grid);
if(col>cc){
var _51=_50.next();
if(!_51){
col--;
}else{
col=0;
_50=_51;
}
}
if(this.grid.edit.isEditing()){
var _52=this.grid.getCell(col);
if(!this.isLastFocusCell()&&!_52.editable){
this._focusifyCellNode(false);
this.cell=_52;
this.rowIndex=_50._str;
this.next();
return;
}
}
this.setFocusIndex(_50._str,col);
}
},previous:function(){
if(this.cell){
var row=(this.rowIndex||0),col=(this.cell.index||0)-1;
var _53=new _3.grid.TreePath(row,this.grid);
if(col<0){
var _54=_53.previous();
if(!_54){
col=0;
}else{
col=this.grid.layout.cellCount-1;
_53=_54;
}
}
if(this.grid.edit.isEditing()){
var _55=this.grid.getCell(col);
if(!this.isFirstFocusCell()&&!_55.editable){
this._focusifyCellNode(false);
this.cell=_55;
this.rowIndex=_53._str;
this.previous();
return;
}
}
this.setFocusIndex(_53._str,col);
}
},move:function(_56,_57){
if(this.isNavHeader()){
this.inherited(arguments);
return;
}
if(!this.cell){
return;
}
var sc=this.grid.scroller,r=this.rowIndex,rc=this.grid.rowCount-1,_58=new _3.grid.TreePath(this.rowIndex,this.grid);
if(_56){
var row;
if(_56>0){
_58=_58.next();
row=_58._arr[0];
if(row>sc.getLastPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop+sc.findScrollTop(row)-sc.findScrollTop(r));
}
}else{
if(_56<0){
_58=_58.previous();
row=_58._arr[0];
if(row<=sc.getPageRow(sc.page)){
this.grid.setScrollTop(this.grid.scrollTop-sc.findScrollTop(r)-sc.findScrollTop(row));
}
}
}
}
var cc=this.grid.layout.cellCount-1,i=this.cell.index,col=Math.min(cc,Math.max(0,i+_57));
var _59=this.grid.getCell(col);
var _5a=_57<0?-1:1;
while(col>=0&&col<cc&&_59&&_59.hidden===true){
col+=_5a;
_59=this.grid.getCell(col);
}
if(!_59||_59.hidden===true){
col=i;
}
if(_56){
this.grid.updateRow(r);
}
this.setFocusIndex(_58._str,col);
}});
_1.declare("dojox.grid.TreeGrid",_3.grid.DataGrid,{defaultOpen:true,sortChildItems:false,openAtLevels:[],treeModel:null,expandoCell:0,aggregator:null,_layoutClass:_3.grid._TreeLayout,createSelection:function(){
this.selection=new _3.grid.TreeSelection(this);
},_childItemSorter:function(a,b,_5b,_5c){
var av=this.store.getValue(a,_5b);
var bv=this.store.getValue(b,_5b);
if(av!=bv){
return av<bv==_5c?1:-1;
}
return 0;
},_onNew:function(_5d,_5e){
if(!_5e||!_5e.item){
this.inherited(arguments);
}else{
var idx=this.getItemIndex(_5e.item);
if(typeof idx=="string"){
this.updateRow(idx.split("/")[0]);
}else{
if(idx>-1){
this.updateRow(idx);
}
}
}
},_onSet:function(_5f,_60,_61,_62){
this._checkUpdateStatus();
if(this.aggregator){
this.aggregator.clearSubtotalCache();
}
var idx=this.getItemIndex(_5f);
if(typeof idx=="string"){
this.updateRow(idx.split("/")[0]);
}else{
if(idx>-1){
this.updateRow(idx);
}
}
},_onDelete:function(_63){
this._cleanupExpandoCache(this._getItemIndex(_63,true),this.store.getIdentity(_63),_63);
this.inherited(arguments);
},_cleanupExpandoCache:function(_64,_65,_66){
},_addItem:function(_67,_68,_69,_6a){
if(!_6a&&this.model&&_1.indexOf(this.model.root.children,_67)==-1){
this.model.root.children[_68]=_67;
}
this.inherited(arguments);
},getItem:function(idx){
var _6b=_1.isArray(idx);
if(_1.isString(idx)&&idx.indexOf("/")){
idx=idx.split("/");
_6b=true;
}
if(_6b&&idx.length==1){
idx=idx[0];
_6b=false;
}
if(!_6b){
return _3.grid.DataGrid.prototype.getItem.call(this,idx);
}
var s=this.store;
var itm=_3.grid.DataGrid.prototype.getItem.call(this,idx[0]);
var cf,i,j;
if(this.aggregator){
cf=this.aggregator.childFields||[];
if(cf){
for(i=0;i<idx.length-1&&itm;i++){
if(cf[i]){
itm=(s.getValues(itm,cf[i])||[])[idx[i+1]];
}else{
itm=null;
}
}
}
}else{
if(this.treeModel){
cf=this.treeModel.childrenAttrs||[];
if(cf&&itm){
for(i=1,il=idx.length;(i<il)&&itm;i++){
for(j=0,jl=cf.length;j<jl;j++){
if(cf[j]){
itm=(s.getValues(itm,cf[j])||[])[idx[i]];
}else{
itm=null;
}
if(itm){
break;
}
}
}
}
}
}
return itm||null;
},_getItemIndex:function(_6c,_6d){
if(!_6d&&!this.store.isItem(_6c)){
return -1;
}
var idx=this.inherited(arguments);
if(idx==-1){
var _6e=this.store.getIdentity(_6c);
return this._by_idty_paths[_6e]||-1;
}
return idx;
},postMixInProperties:function(){
if(this.treeModel&&!("defaultOpen" in this.params)){
this.defaultOpen=false;
}
var def=this.defaultOpen;
this.openAtLevels=_1.map(this.openAtLevels,function(l){
if(typeof l=="string"){
switch(l.toLowerCase()){
case "true":
return true;
break;
case "false":
return false;
break;
default:
var r=parseInt(l,10);
if(isNaN(r)){
return def;
}
return r;
break;
}
}
return l;
});
this._by_idty_paths={};
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
if(this.treeModel){
this._setModel(this.treeModel);
}
},setModel:function(_6f){
this._setModel(_6f);
this._refresh(true);
},_setModel:function(_70){
if(_70&&(!_2.tree.ForestStoreModel||!(_70 instanceof _2.tree.ForestStoreModel))){
throw new Error("dojox.grid.TreeGrid: treeModel must be an instance of dijit.tree.ForestStoreModel");
}
this.treeModel=_70;
_1.toggleClass(this.domNode,"dojoxGridTreeModel",this.treeModel?true:false);
this._setQuery(_70?_70.query:null);
this._setStore(_70?_70.store:null);
},createScroller:function(){
this.inherited(arguments);
this.scroller._origDefaultRowHeight=this.scroller.defaultRowHeight;
},createManagers:function(){
this.rows=new _3.grid._RowManager(this);
this.focus=new _3.grid._TreeFocusManager(this);
this.edit=new _3.grid._EditManager(this);
},_setStore:function(_71){
this.inherited(arguments);
if(this.treeModel&&!this.treeModel.root.children){
this.treeModel.root.children=[];
}
if(this.aggregator){
this.aggregator.store=_71;
}
},getDefaultOpenState:function(_72,_73){
var cf;
var _74=this.store;
if(this.treeModel){
return this.defaultOpen;
}
if(!_72||!_74||!_74.isItem(_73)||!(cf=this.aggregator.childFields[_72.level])){
return this.defaultOpen;
}
if(this.openAtLevels.length>_72.level){
var _75=this.openAtLevels[_72.level];
if(typeof _75=="boolean"){
return _75;
}else{
if(typeof _75=="number"){
return (_74.getValues(_73,cf).length<=_75);
}
}
}
return this.defaultOpen;
},onStyleRow:function(row){
if(!this.layout._isCollapsable){
this.inherited(arguments);
return;
}
var _76=_1.attr(row.node,"dojoxTreeGridBaseClasses");
if(_76){
row.customClasses=_76;
}
var i=row;
var _77=i.node.tagName.toLowerCase();
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected&&_77=="tr"?" dojoxGridRowSelected":"")+(i.over&&_77=="tr"?" dojoxGridRowOver":"");
this.focus.styleRow(i);
this.edit.styleRow(i);
},styleRowNode:function(_78,_79){
if(_79){
if(_79.tagName.toLowerCase()=="div"&&this.aggregator){
_1.query("tr[dojoxTreeGridPath]",_79).forEach(function(_7a){
this.rows.styleRowNode(_1.attr(_7a,"dojoxTreeGridPath"),_7a);
},this);
}
this.rows.styleRowNode(_78,_79);
}
},onCanSelect:function(_7b){
var _7c=_1.query("tr[dojoxTreeGridPath='"+_7b+"']",this.domNode);
if(_7c.length){
if(_1.hasClass(_7c[0],"dojoxGridSummaryRow")){
return false;
}
}
return this.inherited(arguments);
},onKeyDown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=_1.keys;
switch(e.keyCode){
case dk.UP_ARROW:
if(!this.edit.isEditing()&&this.focus.rowIndex!="0"){
_1.stopEvent(e);
this.focus.move(-1,0);
}
break;
case dk.DOWN_ARROW:
var _7d=new _3.grid.TreePath(this.focus.rowIndex,this);
var _7e=new _3.grid.TreePath(this.rowCount-1,this);
_7e=_7e.lastChild(true);
if(!this.edit.isEditing()&&_7d.toString()!=_7e.toString()){
_1.stopEvent(e);
this.focus.move(1,0);
}
break;
default:
this.inherited(arguments);
break;
}
},canEdit:function(_7f,_80){
var _81=_7f.getNode(_80);
return _81&&this._canEdit;
},doApplyCellEdit:function(_82,_83,_84){
var _85=this.getItem(_83);
var _86=this.store.getValue(_85,_84);
if(typeof _86=="number"){
_82=isNaN(_82)?_82:parseFloat(_82);
}else{
if(typeof _86=="boolean"){
_82=_82=="true"?true:_82=="false"?false:_82;
}else{
if(_86 instanceof Date){
var _87=new Date(_82);
_82=isNaN(_87.getTime())?_82:_87;
}
}
}
this.store.setValue(_85,_84,_82);
this.onApplyCellEdit(_82,_83,_84);
}});
_3.grid.TreeGrid.markupFactory=function(_88,_89,_8a,_8b){
var d=_1;
var _8c=function(n){
var w=d.attr(n,"width")||"auto";
if((w!="auto")&&(w.slice(-2)!="em")&&(w.slice(-1)!="%")){
w=parseInt(w,10)+"px";
}
return w;
};
var _8d=function(_8e){
var _8f;
if(_8e.nodeName.toLowerCase()=="table"&&d.query("> colgroup",_8e).length===0&&(_8f=d.query("> thead > tr",_8e)).length==1){
var tr=_8f[0];
return d.query("> th",_8f[0]).map(function(th){
var _90={type:d.trim(d.attr(th,"cellType")||""),field:d.trim(d.attr(th,"field")||"")};
if(_90.type){
_90.type=d.getObject(_90.type);
}
var _91=d.query("> table",th)[0];
if(_91){
_90.name="";
_90.children=_8d(_91);
if(d.hasAttr(th,"itemAggregates")){
_90.itemAggregates=d.map(d.attr(th,"itemAggregates").split(","),function(v){
return d.trim(v);
});
}else{
_90.itemAggregates=[];
}
if(d.hasAttr(th,"aggregate")){
_90.aggregate=d.attr(th,"aggregate");
}
_90.type=_90.type||_3.grid.cells.SubtableCell;
}else{
_90.name=d.trim(d.attr(th,"name")||th.innerHTML);
if(d.hasAttr(th,"width")){
_90.width=_8c(th);
}
if(d.hasAttr(th,"relWidth")){
_90.relWidth=window.parseInt(d.attr(th,"relWidth"),10);
}
if(d.hasAttr(th,"hidden")){
_90.hidden=d.attr(th,"hidden")=="true";
}
_90.field=_90.field||_90.name;
_3.grid.DataGrid.cell_markupFactory(_8b,th,_90);
_90.type=_90.type||_3.grid.cells.Cell;
}
if(_90.type&&_90.type.markupFactory){
_90.type.markupFactory(th,_90);
}
return _90;
});
}
return [];
};
var _92;
if(!_88.structure){
var row=_8d(_89);
if(row.length){
_88.structure=[{__span:Infinity,cells:[row]}];
}
}
return _3.grid.DataGrid.markupFactory(_88,_89,_8a,_8b);
};
return _3.grid.TreeGrid;
});
