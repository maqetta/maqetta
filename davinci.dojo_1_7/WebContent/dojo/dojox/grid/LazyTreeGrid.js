/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/grid/resources/Expando.html"]="<div class=\"dojoxGridExpando\"\n\t><div class=\"dojoxGridExpandoNode\" dojoAttachEvent=\"onclick:onToggle\"\n\t\t><div class=\"dojoxGridExpandoNodeInner\" dojoAttachPoint=\"expandoInner\"></div\n\t></div\n></div>\n";
define("dojox/grid/LazyTreeGrid",["dojo","dijit","dojox","dojo/text!./resources/Expando.html","./_View","./TreeGrid","./cells/tree","./LazyTreeGridStoreModel"],function(_1,_2,_3,_4){
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
}else{
_1.removeClass(this.domNode,"dojoxGridExpandoOpened");
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
var _53=0,i=this.items.length-1;
for(;i>=0;i--){
if(this.items[i].treePath.indexOf(_52+"/")===0&&this.items[i].treePath!==_52){
this.items.splice(i,1);
_53++;
}
}
return _53;
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
},setModel:function(_54){
if(!_54){
return;
}
this._setModel(_54);
this._cleanup();
this._refresh(true);
},setStore:function(_55,_56,_57){
if(!_55){
return;
}
this._setQuery(_56,_57);
this.treeModel.query=_56;
this.treeModel.store=_55;
this.treeModel.root.children=[];
this.setModel(this.treeModel);
},_setQuery:function(_58,_59){
this.inherited(arguments);
this.treeModel.query=_58;
},destroy:function(){
this._cleanup();
this.inherited(arguments);
},_cleanup:function(){
this.cache.emptyCache();
this._cleanupExpandoCache();
},setSortIndex:function(_5a,_5b){
if(this.canSort(_5a+1)){
this._cleanup();
}
this.inherited(arguments);
},_refresh:function(_5c){
this._clearData();
this.updateRowCount(this.cache.items.length);
this._fetch(0,true);
},render:function(){
this.inherited(arguments);
this.setScrollTop(this.scrollTop);
},_onNew:function(_5d,_5e){
var _5f=false,_60,_61=this.cache.items;
if(_5e&&this.store.isItem(_5e.item)&&_1.some(this.treeModel.childrenAttrs,function(c){
return c===_5e.attribute;
})){
_5f=true;
_60=this.cache.getInfoByItem(_5e.item);
}
if(!_5f){
this.inherited(arguments);
var _62=len>0?String(parseInt(_61[_61.length-1].treePath.split("/")[0],10)+1):"0";
this.cache.insertItem(this.get("rowCount"),{item:_5d,treePath:_62,expandoStatus:false});
}else{
if(_60&&_60.expandoStatus&&_60.rowIdx>=0){
var _63=_60.childrenNum;
var _64=_60.treePath+"/"+_63;
var _65={item:_5d,treePath:_64,expandoStatus:false};
this.cache.insertItem(_60.rowIdx+_63+1,_65);
this.cache.updateCache(_60.rowIdx,{childrenNum:_63+1});
var _66=this.store.getIdentity(_5d);
this._by_idty[_66]={idty:_66,item:_5d};
this._by_idx.splice(_60.rowIdx+_63+1,0,this._by_idty[_66]);
this.updateRowCount(_61.length);
this.updateRows(_60.rowIdx+_63+1,this.keepRows);
}else{
if(_60&&_60.rowIdx>=0){
this.updateRow(_60.rowIdx);
}
}
}
},_onDelete:function(_67){
var _68=this.cache.getInfoByItem(_67),i;
if(_68&&_68.rowIdx>=0){
if(_68.expandoStatus){
var num=this.cache.cleanChildren(_68.rowIdx);
this._by_idx.splice(_68.rowIdx+1,num);
}
if(_68.treePath.indexOf("/")>0){
var _69=_68.treePath.substring(0,_68.treePath.lastIndexOf("/"));
for(i=_68.rowIdx;i>=0;i--){
if(this.cache.items[i].treePath===_69){
this.cache.items[i].childrenNum--;
break;
}
}
}
this.cache.deleteItem(_68.rowIdx);
this._by_idx.splice(_68.rowIdx,1);
this.updateRowCount(this.cache.items.length);
this.updateRows(_68.rowIdx,this.keepRows);
}
},_cleanupExpandoCache:function(_6a,_6b,_6c){
},_fetch:function(_6d,_6e){
if(!this._loading){
this._loading=true;
}
_6d=_6d||0;
this.reqQueue=[];
var i=0,_6f=[];
var _70=Math.min(this.rowsPerPage,this.cache.items.length-_6d);
for(i=_6d;i<_70;i++){
if(this.cache.getItemByRowIndex(i)){
_6f.push(this.cache.getItemByRowIndex(i));
}else{
break;
}
}
if(_6f.length===_70){
this._reqQueueLen=1;
this._onFetchBegin(this.cache.items.length,{startRowIdx:_6d,count:_70});
this._onFetchComplete(_6f,{startRowIdx:_6d,count:_70});
}else{
this.reqQueueIndex=0;
var _71="",_72="",_73=_6d,_74=this.cache.getTreePathByRowIndex(_6d);
_70=0;
for(i=_6d+1;i<_6d+this.rowsPerPage;i++){
if(!this.cache.getTreePathByRowIndex(i)){
break;
}
_71=this.cache.getTreePathByRowIndex(i-1).split("/").length-1;
_72=this.cache.getTreePathByRowIndex(i).split("/").length-1;
if(_71!==_72){
this.reqQueue.push({startTreePath:_74,startRowIdx:_73,count:_70+1});
_70=0;
_73=i;
_74=this.cache.getTreePathByRowIndex(i);
}else{
_70++;
}
}
this.reqQueue.push({startTreePath:_74,startRowIdx:_73,count:_70+1});
this._reqQueueLen=this.reqQueue.length;
for(i=0;i<this.reqQueue.length;i++){
this._fetchItems(i,_1.hitch(this,"_onFetchBegin"),_1.hitch(this,"_onFetchComplete"),_1.hitch(this,"_onFetchError"));
}
}
},_fetchItems:function(idx,_75,_76,_77){
this.showMessage(this.loadingMessage);
var _78=this.reqQueue[idx].startTreePath.split("/").length-1;
this._pending_requests[this.reqQueue[idx].startRowIdx]=true;
if(_78===0){
this.store.fetch({start:parseInt(this.reqQueue[idx].startTreePath,10),startRowIdx:this.reqQueue[idx].startRowIdx,count:this.reqQueue[idx].count,query:this.query,sort:this.getSortProps(),queryOptions:this.queryOptions,onBegin:_75,onComplete:_76,onError:_77});
}else{
var _79=this.reqQueue[idx].startTreePath;
var _7a=_79.substring(0,_79.lastIndexOf("/"));
var _7b=_79.substring(_79.lastIndexOf("/")+1);
var _7c=this.cache.getItemByTreePath(_7a);
if(!_7c){
throw new Error("Lazy loading TreeGrid on fetch error:");
}
var _7d=this.store.getIdentity(_7c);
this.queryObj={start:parseInt(_7b,10),startRowIdx:this.reqQueue[idx].startRowIdx,count:this.reqQueue[idx].count,parentId:_7d,sort:this.getSortProps()};
this.treeModel.getChildren(_7c,_76,_77,this.queryObj);
}
},_onFetchBegin:function(_7e,_7f){
this.cache.initCache(_7e);
_7e=this.cache.items.length;
this.inherited(arguments);
},filter:function(_80,_81){
this.cache.emptyCache();
this.inherited(arguments);
},_onFetchComplete:function(_82,_83,_84){
var _85="",_86,_87,_88;
if(_82&&_82.length>0){
if(_83){
_86=_83.startRowIdx;
_87=_83.count;
_88=0;
}else{
_86=this.queryObj.startRowIdx;
_87=this.queryObj.count;
_88=this.queryObj.start;
}
var i;
for(i=0;i<_87;i++){
_85=this.cache.getTreePathByRowIndex(_86+i);
if(_85){
if(!this.cache.getItemByRowIndex(_86+i)){
this.cache.cacheItem(_86+i,{item:_82[_88+i],treePath:_85,expandoStatus:this.cache.getExpandoStatusByRowIndex(_86+i)});
}
}
}
this._pending_requests[_86]=false;
if(!this.scroller){
return;
}
var len=Math.min(_87,_82.length);
for(i=0;i<len;i++){
this._addItem(_82[_88+i],_86+i,true);
}
this.updateRows(_86,len);
}
if(!this.cache.items.length){
this.showMessage(this.noDataMessage);
}else{
this.showMessage();
}
this._reqQueueLen--;
if(this._loading&&this._reqQueueLen===0){
this._loading=false;
if(this._lastScrollTop){
this.setScrollTop(this._lastScrollTop);
}
}
},expandoFetch:function(_89,_8a){
if(this._loading){
return;
}
this._loading=true;
this.toggleLoadingClass(true);
var _8b=this.cache.getItemByRowIndex(_89);
this.expandoRowIndex=_89;
this._pages=[];
if(_8a){
var _8c=this.store.getIdentity(_8b);
var _8d={start:0,count:this.keepRows,parentId:_8c,sort:this.getSortProps()};
this.treeModel.getChildren(_8b,_1.hitch(this,"_onExpandoComplete"),_1.hitch(this,"_onFetchError"),_8d);
}else{
var num=this.cache.cleanChildren(_89);
this._by_idx.splice(_89+1,num);
this.updateRowCount(this.cache.items.length);
this.updateRows(_89+1,this.keepRows);
this.toggleLoadingClass(false);
if(this._loading){
this._loading=false;
}
}
},_onExpandoComplete:function(_8e,_8f,_90){
var _91=this.cache.getTreePathByRowIndex(this.expandoRowIndex);
if(_90&&!isNaN(parseInt(_90,10))){
_90=parseInt(_90,10);
}else{
_90=_8e.length;
}
var i,j=0,len=this._by_idx.length;
for(i=this.expandoRowIndex+1;j<_90;i++,j++){
this.cache.insertItem(i,{item:null,treePath:_91+"/"+j,expandoStatus:false});
}
this.updateRowCount(this.cache.items.length);
this.cache.updateCache(this.expandoRowIndex,{childrenNum:_90});
for(i=0;i<_90;i++){
this.cache.updateCache(this.expandoRowIndex+1+i,{item:_8e[i]});
}
for(i=0;i<_90;i++){
this._by_idx.splice(this.expandoRowIndex+1+i,0,null);
}
for(i=0;i<Math.min(_90,this.keepRows);i++){
var _92=this.store.getIdentity(_8e[i]);
this._by_idty[_92]={idty:_92,item:_8e[i]};
this._by_idx.splice(this.expandoRowIndex+1+i,1,this._by_idty[_92]);
}
this.updateRows(this.expandoRowIndex+1,this.keepRows);
this.toggleLoadingClass(false);
this.stateChangeNode=null;
if(this._loading){
this._loading=false;
}
this.focus._delayedCellFocus();
},toggleLoadingClass:function(_93){
if(this.stateChangeNode){
_1.toggleClass(this.stateChangeNode,"dojoxGridExpandoLoading",_93);
}
},styleRowNode:function(_94,_95){
if(_95){
this.rows.styleRowNode(_94,_95);
}
},onStyleRow:function(row){
if(!this.layout._isCollapsable){
this.inherited(arguments);
return;
}
var _96=_1.attr(row.node,"dojoxTreeGridBaseClasses");
if(_96){
row.customClasses=_96;
}
var i=row;
i.customClasses+=(i.odd?" dojoxGridRowOdd":"")+(i.selected?" dojoxGridRowSelected":"")+(i.over?" dojoxGridRowOver":"");
this.focus.styleRow(i);
this.edit.styleRow(i);
},dokeydown:function(e){
if(e.altKey||e.metaKey){
return;
}
var dk=_1.keys,_97=_2.findWidgets(e.target)[0];
if(e.keyCode===dk.ENTER&&_97 instanceof _3.grid._LazyExpando){
_97.onToggle();
}
this.onKeyDown(e);
}});
_3.grid.LazyTreeGrid.markupFactory=function(_98,_99,_9a,_9b){
return _3.grid.TreeGrid.markupFactory(_98,_99,_9a,_9b);
};
return _3.grid.LazyTreeGrid;
});
