/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

require.cache["dojox/grid/resources/Expando.html"]="<div class=\"dojoxGridExpando\"\n\t><div class=\"dojoxGridExpandoNode\" dojoAttachEvent=\"onclick:onToggle\"\n\t\t><div class=\"dojoxGridExpandoNodeInner\" dojoAttachPoint=\"expandoInner\"></div\n\t></div\n></div>\n";
define(["dojo","dijit","dojox","dojo/text!./resources/Expando.html","./_View","./TreeGrid","./cells/tree","./LazyTreeGridStoreModel"],function(_1,_2,_3,_4){
_1.declare("dojox.grid._LazyExpando",[_2._Widget,_2._TemplatedMixin],{itemId:"",cellIdx:-1,view:null,rowIdx:-1,expandoCell:null,level:0,open:false,templateString:_4,onToggle:function(_5){
this.setOpen(!this.view.grid.cache.getExpandoStatusByRowIndex(this.rowIdx));
try{
_1.stopEvent(_5);
}
catch(e){
}
},setOpen:function(_6){
var g=this.view.grid,_7=g.cache.getItemByRowIndex(this.rowIdx);
if(!g.treeModel.mayHaveChildren(_7)){
g.stateChangeNode=null;
return;
}
if(_7&&!g._loading){
g.stateChangeNode=this.domNode;
g.cache.updateCache(this.rowIdx,{"expandoStatus":_6});
g.expandoFetch(this.rowIdx,_6);
this.open=_6;
}
this._updateOpenState(_7);
},_updateOpenState:function(_8){
var _9=this.view.grid;
if(_8&&_9.treeModel.mayHaveChildren(_8)){
var _a=_9.cache.getExpandoStatusByRowIndex(this.rowIdx);
this.expandoInner.innerHTML=_a?"-":"+";
_1.toggleClass(this.domNode,"dojoxGridExpandoOpened",_a);
this.domNode.parentNode.setAttribute("aria-expanded",_a);
}
},setRowNode:function(_b,_c,_d){
if(this.cellIdx<0||!this.itemId){
return false;
}
this._initialized=false;
this.view=_d;
this.rowIdx=_b;
this.expandoCell=_d.structure.cells[0][this.cellIdx];
var d=this.domNode;
if(d&&d.parentNode&&d.parentNode.parentNode){
this._tableRow=d.parentNode.parentNode;
}
_1.style(this.domNode,"marginLeft",(this.level*1.125)+"em");
this._updateOpenState(_d.grid.cache.getItemByRowIndex(this.rowIdx));
return true;
}});
_1.declare("dojox.grid._TreeGridContentBuilder",_3.grid._ContentBuilder,{generateHtml:function(_e,_f){
var _10=this.getTableArray(),_11=this.grid,v=this.view,_12=v.structure.cells,_13=_11.getItem(_f),_14=0,_15=_11.cache.getTreePathByRowIndex(_f),_16=[],_17=[];
_3.grid.util.fire(this.view,"onBeforeRow",[_f,_12]);
if(_13!==null&&_15!==null){
_16=_15.split("/");
_14=_16.length-1;
_17[0]="dojoxGridRowToggle-"+_16.join("-");
if(!_11.treeModel.mayHaveChildren(_13)){
_17.push("dojoxGridNoChildren");
}
}
for(var j=0,row;(row=_12[j]);j++){
if(row.hidden||row.header){
continue;
}
var tr="<tr style=\"\" class=\""+_17.join(" ")+"\" dojoxTreeGridPath=\""+_16.join("/")+"\" dojoxTreeGridBaseClasses=\""+_17.join(" ")+"\">";
_10.push(tr);
var k=0,_18=this._getColSpans(_14);
var _19=0,_1a=[];
if(_18){
_1.forEach(_18,function(c){
for(var i=0,_1b;(_1b=row[i]);i++){
if(i>=c.start&&i<=c.end){
_19+=this._getCellWidth(row,i);
}
}
_1a.push(_19);
_19=0;
},this);
}
for(var i=0,_1c,m,cc,cs;(_1c=row[i]);i++){
m=_1c.markup;
cc=_1c.customClasses=[];
cs=_1c.customStyles=[];
if(_18&&_18[k]&&(i>=_18[k].start&&i<=_18[k].end)){
var _1d=_18[k].primary?_18[k].primary:_18[k].start;
if(i==_1d){
m[5]=_1c.formatAtLevel(_16,_13,_14,false,_17[0],cc,_f);
m[1]=cc.join(" ");
var pbm=_1.marginBox(_1c.getHeaderNode()).w-_1.contentBox(_1c.getHeaderNode()).w;
cs=_1c.customStyles=["width:"+(_1a[k]-pbm)+"px"];
m[3]=cs.join(";");
_10.push.apply(_10,m);
}else{
if(i==_18[k].end){
k++;
continue;
}else{
continue;
}
}
}else{
m[5]=_1c.formatAtLevel(_16,_13,_14,false,_17[0],cc,_f);
m[1]=cc.join(" ");
m[3]=cs.join(";");
_10.push.apply(_10,m);
}
}
_10.push("</tr>");
}
_10.push("</table>");
return _10.join("");
},_getColSpans:function(_1e){
var _1f=this.grid.colSpans;
if(_1f&&(_1f[_1e])){
return _1f[_1e];
}else{
return null;
}
},_getCellWidth:function(_20,_21){
var _22=_20[_21].getHeaderNode();
if(_21==_20.length-1||_1.every(_20.slice(_21+1),function(_23){
return _23.hidden;
})){
var _24=_1.position(_20[_21].view.headerContentNode.firstChild);
return _24.x+_24.w-_1.position(_22).x;
}else{
var _25=_20[_21+1].getHeaderNode();
return _1.position(_25).x-_1.position(_22).x;
}
}});
_1.declare("dojox.grid._TreeGridView",[_3.grid._View],{_contentBuilderClass:_3.grid._TreeGridContentBuilder,postCreate:function(){
this.inherited(arguments);
this._expandos={};
this.connect(this.grid,"_cleanupExpandoCache","_cleanupExpandoCache");
},_cleanupExpandoCache:function(_26,_27,_28){
if(_26==-1){
return;
}
_1.forEach(this.grid.layout.cells,function(_29){
if(_29.openStates&&_27 in _29.openStates){
delete _29.openStates[_27];
}
});
for(var i in this._expandos){
if(this._expandos[i]){
this._expandos[i].destroy();
}
}
this._expandos={};
},onAfterRow:function(_2a,_2b,_2c){
_1.query("span.dojoxGridExpando",_2c).forEach(function(n){
if(n&&n.parentNode){
var _2d,_2e,_2f=this.grid._by_idx;
if(_2f&&_2f[_2a]&&_2f[_2a].idty){
_2d=_2f[_2a].idty;
_2e=this._expandos[_2d];
}
if(_2e){
_1.place(_2e.domNode,n,"replace");
_2e.itemId=n.getAttribute("itemId");
_2e.cellIdx=parseInt(n.getAttribute("cellIdx"),10);
if(isNaN(_2e.cellIdx)){
_2e.cellIdx=-1;
}
}else{
_2e=_1.parser.parse(n.parentNode)[0];
if(_2d){
this._expandos[_2d]=_2e;
}
}
if(!_2e.setRowNode(_2a,_2c,this)){
_2e.domNode.parentNode.removeChild(_2e.domNode);
}
_1.destroy(n);
}
},this);
this.inherited(arguments);
}});
_3.grid.cells.LazyTreeCell=_1.mixin(_1.clone(_3.grid.cells.TreeCell),{formatAtLevel:function(_30,_31,_32,_33,_34,_35,_36){
if(!_31){
return this.formatIndexes(_36,_30,_31,_32);
}
if(!_1.isArray(_30)){
_30=[_30];
}
var _37="";
var ret="";
if(this.isCollapsable){
var _38=this.grid.store,id="";
if(_31&&_38.isItem(_31)){
id=_38.getIdentity(_31);
}
_35.push("dojoxGridExpandoCell");
ret="<span "+_1._scopeName+"Type=\"dojox.grid._LazyExpando\" level=\""+_32+"\" class=\"dojoxGridExpando\""+"\" toggleClass=\""+_34+"\" itemId=\""+id+"\" cellIdx=\""+this.index+"\"></span>";
}
_37=ret+this.formatIndexes(_36,_30,_31,_32);
if(this.grid.focus.cell&&this.index==this.grid.focus.cell.index&&_30.join("/")==this.grid.focus.rowIndex){
_35.push(this.grid.focus.focusClass);
}
return _37;
},formatIndexes:function(_39,_3a,_3b,_3c){
var _3d=this.grid.edit.info,d=this.get?this.get(_3a[0],_3b,_3a):(this.value||this.defaultValue);
if(this.editable&&(this.alwaysEditing||(_3d.rowIndex==_3a[0]&&_3d.cell==this))){
return this.formatEditing(d,_39,_3a);
}else{
return this._defaultFormat(d,[d,_39,_3c,this]);
}
}});
_1.declare("dojox.grid._LazyTreeLayout",_3.grid._Layout,{setStructure:function(_3e){
var s=_3e;
var g=this.grid;
if(g&&!_1.every(s,function(i){
return ("cells" in i);
})){
s=arguments[0]=[{cells:[s]}];
}
if(s.length==1&&s[0].cells.length==1){
s[0].type="dojox.grid._TreeGridView";
this._isCollapsable=true;
s[0].cells[0][this.grid.expandoCell].isCollapsable=true;
}
this.inherited(arguments);
},addCellDef:function(_3f,_40,_41){
var obj=this.inherited(arguments);
return _1.mixin(obj,_3.grid.cells.LazyTreeCell);
}});
_1.declare("dojox.grid.TreeGridItemCache",null,{unInit:true,items:null,constructor:function(_42){
this.rowsPerPage=_42.rowsPerPage;
this._buildCache(_42.rowsPerPage);
},_buildCache:function(_43){
this.items=[];
for(var i=0;i<_43;i++){
this.cacheItem(i,{item:null,treePath:i+"",expandoStatus:false});
}
},cacheItem:function(_44,_45){
this.items[_44]=_1.mixin({item:null,treePath:"",expandoStatus:false},_45);
},insertItem:function(_46,_47){
this.items.splice(_46,0,_1.mixin({item:null,treePath:"",expandoStatus:false},_47));
},initCache:function(_48){
if(!this.unInit){
return;
}
this._buildCache(_48);
this.unInit=false;
},getItemByRowIndex:function(_49){
return this.items[_49]?this.items[_49].item:null;
},getItemByTreePath:function(_4a){
for(var i=0,len=this.items.length;i<len;i++){
if(this.items[i].treePath===_4a){
return this.items[i].item;
}
}
return null;
},getTreePathByRowIndex:function(_4b){
return this.items[_4b]?this.items[_4b].treePath:null;
},getExpandoStatusByRowIndex:function(_4c){
return this.items[_4c]?this.items[_4c].expandoStatus:null;
},getInfoByItem:function(_4d){
for(var i=0,len=this.items.length;i<len;i++){
if(this.items[i].item==_4d){
return _1.mixin({rowIdx:i},this.items[i]);
}
}
return null;
},updateCache:function(_4e,_4f){
if(this.items[_4e]){
_1.mixin(this.items[_4e],_4f);
}
},deleteItem:function(_50){
if(this.items[_50]){
this.items.splice(_50,1);
}
},cleanChildren:function(_51){
var _52=this.getTreePathByRowIndex(_51);
for(var i=this.items.length-1;i>=0;i--){
if(this.items[i].treePath.indexOf(_52)===0&&this.items[i].treePath!==_52){
this.items.splice(i,1);
}
}
},emptyCache:function(){
this.unInit=true;
this._buildCache(this.rowsPerPage);
},cleanupCache:function(){
this.items=null;
}});
_1.declare("dojox.grid.LazyTreeGrid",_3.grid.TreeGrid,{treeModel:null,_layoutClass:_3.grid._LazyTreeLayout,colSpans:null,postCreate:function(){
this.inherited(arguments);
this.cache=new _3.grid.TreeGridItemCache(this);
if(!this.treeModel||!(this.treeModel instanceof _2.tree.ForestStoreModel)){
throw new Error("dojox.grid.LazyTreeGrid: must use a treeModel and treeModel must be an instance of dijit.tree.ForestStoreModel");
}
_1.addClass(this.domNode,"dojoxGridTreeModel");
_1.setSelectable(this.domNode,this.selectable);
},createManagers:function(){
this.rows=new _3.grid._RowManager(this);
this.focus=new _3.grid._FocusManager(this);
this.edit=new _3.grid._EditManager(this);
},createSelection:function(){
this.selection=new _3.grid.DataSelection(this);
},setModel:function(_53){
if(!_53){
return;
}
this._setModel(_53);
this._refresh(true);
},setStore:function(_54,_55,_56){
if(!_54){
return;
}
this._setQuery(_55,_56);
this.treeModel.query=_55;
this.treeModel.store=_54;
this.treeModel.root.children=[];
this.setModel(this.treeModel);
},_setQuery:function(_57,_58){
this.inherited(arguments);
this.treeModel.query=_57;
},destroy:function(){
this._cleanup();
this.inherited(arguments);
},_cleanup:function(){
this.cache.emptyCache();
this._cleanupExpandoCache();
},setSortIndex:function(_59,_5a){
if(this.canSort(_59+1)){
this._cleanup();
}
this.inherited(arguments);
},_refresh:function(_5b){
this._cleanup();
this.inherited(arguments);
},render:function(){
this.inherited(arguments);
this.setScrollTop(this.scrollTop);
},_onNew:function(_5c,_5d){
var _5e=false;
var _5f;
if(_5d&&this.store.isItem(_5d.item)&&_1.some(this.treeModel.childrenAttrs,function(c){
return c===_5d.attribute;
})){
_5e=true;
_5f=this.cache.getInfoByItem(_5d.item);
}
if(!_5e){
this.inherited(arguments);
var _60=this.cache.items;
var _61=(parseInt(_60[_60.length-1].treePath.split("/")[0],10)+1)+"";
this.cache.insertItem(this.get("rowCount"),{item:_5c,treePath:_61,expandoStatus:false});
}else{
if(_5f&&_5f.expandoStatus&&_5f.rowIdx>=0){
this.expandoFetch(_5f.rowIdx,false);
this.expandoFetch(_5f.rowIdx,true);
}else{
if(_5f&&_5f.rowIdx){
this.updateRow(_5f.rowIdx);
}
}
}
},_onDelete:function(_62){
this._pages=[];
this._bop=-1;
this._eop=-1;
this._refresh();
},_cleanupExpandoCache:function(_63,_64,_65){
},_fetch:function(_66,_67){
_66=_66||0;
this.reqQueue=[];
var i=0,_68=[];
var _69=Math.min(this.rowsPerPage,this.cache.items.length-_66);
for(i=_66;i<_69;i++){
if(this.cache.getItemByRowIndex(i)){
_68.push(this.cache.getItemByRowIndex(i));
}else{
break;
}
}
if(_68.length===_69){
this._onFetchComplete(_68,{startRowIdx:_66,count:_69});
}else{
this.reqQueueIndex=0;
var _6a="",_6b="",_6c=_66,_6d=this.cache.getTreePathByRowIndex(_66);
_69=0;
for(i=_66+1;i<_66+this.rowsPerPage;i++){
if(!this.cache.getTreePathByRowIndex(i)){
break;
}
_6a=this.cache.getTreePathByRowIndex(i-1).split("/").length-1;
_6b=this.cache.getTreePathByRowIndex(i).split("/").length-1;
if(_6a!==_6b){
this.reqQueue.push({startTreePath:_6d,startRowIdx:_6c,count:_69+1});
_69=0;
_6c=i;
_6d=this.cache.getTreePathByRowIndex(i);
}else{
_69++;
}
}
this.reqQueue.push({startTreePath:_6d,startRowIdx:_6c,count:_69+1});
var len=this.reqQueue.length;
for(i=0;i<len;i++){
this._fetchItems(i,_1.hitch(this,"_onFetchBegin"),_1.hitch(this,"_onFetchComplete"),_1.hitch(this,"_onFetchError"));
}
}
},_fetchItems:function(idx,_6e,_6f,_70){
if(!this._loading){
this._loading=true;
this.showMessage(this.loadingMessage);
}
var _71=this.reqQueue[idx].startTreePath.split("/").length-1;
this._pending_requests[this.reqQueue[idx].startRowIdx]=true;
if(_71===0){
this.store.fetch({start:parseInt(this.reqQueue[idx].startTreePath,10),startRowIdx:this.reqQueue[idx].startRowIdx,count:this.reqQueue[idx].count,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,onBegin:_6e,onComplete:_6f,onError:_70});
}else{
var _72=this.reqQueue[idx].startTreePath;
var _73=_72.substring(0,_72.lastIndexOf("/"));
var _74=_72.substring(_72.lastIndexOf("/")+1);
var _75=this.cache.getItemByTreePath(_73);
if(!_75){
throw new Error("Lazy loading TreeGrid on fetch error:");
}
var _76=this.store.getIdentity(_75);
this.queryObj={start:parseInt(_74,10),startRowIdx:this.reqQueue[idx].startRowIdx,count:this.reqQueue[idx].count,parentId:_76,sort:this.getSortProps()};
this.treeModel.getChildren(_75,_6f,_70,this.queryObj);
}
},_onFetchBegin:function(_77,_78){
this.cache.initCache(_77);
_77=this.cache.items.length;
this.inherited(arguments);
},filter:function(_79,_7a){
this.cache.emptyCache();
this.inherited(arguments);
},_onFetchComplete:function(_7b,_7c,_7d){
var _7e="",_7f,_80,_81;
if(_7c){
_7f=_7c.startRowIdx;
_80=_7c.count;
_81=0;
}else{
_7f=this.queryObj.startRowIdx;
_80=this.queryObj.count;
_81=this.queryObj.start;
}
for(var i=0;i<_80;i++){
_7e=this.cache.getTreePathByRowIndex(_7f+i);
if(_7e){
if(!this.cache.getItemByRowIndex(_7f+i)){
this.cache.cacheItem(_7f+i,{item:_7b[_81+i],treePath:_7e,expandoStatus:false});
}
}
}
this._pending_requests[_7f]=false;
if(!this.scroller){
return;
}
var len=Math.min(_80,_7b.length);
for(i=0;i<len;i++){
this._addItem(_7b[_81+i],_7f+i,true);
}
this.updateRows(_7f,len);
if(this._lastScrollTop){
this.setScrollTop(this._lastScrollTop);
}
if(this._loading){
this._loading=false;
if(!this.cache.items.length){
this.showMessage(this.noDataMessage);
}else{
this.showMessage();
}
}
},expandoFetch:function(_82,_83){
if(this._loading){
return;
}
this._loading=true;
this.toggleLoadingClass(true);
var _84=this.cache.getItemByRowIndex(_82);
this.expandoRowIndex=_82;
this._pages=[];
if(_83){
var _85=this.store.getIdentity(_84);
var _86={start:0,count:this.keepRows,parentId:_85,sort:this.getSortProps()};
this.treeModel.getChildren(_84,_1.hitch(this,"_onExpandoComplete"),_1.hitch(this,"_onFetchError"),_86);
}else{
this.cache.cleanChildren(_82);
for(var i=_82+1,len=this._by_idx.length;i<len;i++){
delete this._by_idx[i];
}
this.updateRowCount(this.cache.items.length);
if(this.cache.getTreePathByRowIndex(_82+1)){
this._fetch(_82+1);
}else{
this._fetch(_82);
}
this.toggleLoadingClass(false);
}
},_onExpandoComplete:function(_87,_88,_89){
var _8a=this.cache.getTreePathByRowIndex(this.expandoRowIndex);
if(_89&&!isNaN(parseInt(_89,10))){
_89=parseInt(_89,10);
}else{
_89=_87.length;
}
var i,j=0,len=this._by_idx.length;
for(i=this.expandoRowIndex+1;j<_89;i++,j++){
this.cache.insertItem(i,{item:null,treePath:_8a+"/"+j,expandoStatus:false});
}
this.updateRowCount(this.cache.items.length);
for(i=this.expandoRowIndex+1;i<len;i++){
delete this._by_idx[i];
}
this.cache.updateCache(this.expandoRowIndex,{childrenNum:_89});
for(i=0;i<_89;i++){
this.cache.updateCache(this.expandoRowIndex+1+i,{item:_87[i]});
}
for(i=0;i<Math.min(_89,this.keepRows);i++){
this._addItem(_87[i],this.expandoRowIndex+1+i,false);
this.updateRow(this.expandoRowIndex+1+i);
}
this.toggleLoadingClass(false);
this.stateChangeNode=null;
if(this._loading){
this._loading=false;
}
if(_89<this.keepRows&&this.cache.getTreePathByRowIndex(this.expandoRowIndex+1+_89)){
this._fetch(this.expandoRowIndex+1+_89);
}
},toggleLoadingClass:function(_8b){
if(this.stateChangeNode){
_1.toggleClass(this.stateChangeNode,"dojoxGridExpandoLoading",_8b);
}
},styleRowNode:function(_8c,_8d){
if(_8d){
this.rows.styleRowNode(_8c,_8d);
}
},onStyleRow:function(row){
if(!this.layout._isCollapsable){
this.inherited(arguments);
return;
}
var _8e=_1.attr(row.node,"dojoxTreeGridBaseClasses");
if(_8e){
row.customClasses=_8e;
}
var i=row;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(i);
this.edit.styleRow(i);
},dokeydown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=_1.keys,_8f=e.target,_90=_8f&&_8f.firstChild?_2.byId(_8f.firstChild.id):null;
if(e.keyCode===dk.ENTER&&_90 instanceof _3.grid._LazyExpando){
_90.onToggle();
}
this.onKeyDown(e);
}});
_3.grid.LazyTreeGrid.markupFactory=function(_91,_92,_93,_94){
return _3.grid.TreeGrid.markupFactory(_91,_92,_93,_94);
};
return _3.grid.LazyTreeGrid;
});
