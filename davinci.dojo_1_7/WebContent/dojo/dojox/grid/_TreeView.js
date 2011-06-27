/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
require.cache["dojox/grid/resources/Expando.html"]="<div class=\"dojoxGridExpando\"\n\t><div class=\"dojoxGridExpandoNode\" dojoAttachEvent=\"onclick:onToggle\"\n\t\t><div class=\"dojoxGridExpandoNodeInner\" dojoAttachPoint=\"expandoInner\"></div\n\t></div\n></div>\n";
define("dojox/grid/_TreeView",["dojo","dijit","dojox","dojo/text!./resources/Expando.html","dijit/_Widget","dijit/_TemplatedMixin","./_View"],function(_1,_2,_3,_4){
_1.declare("dojox.grid._Expando",[_2._Widget,_2._TemplatedMixin],{open:false,toggleClass:"",itemId:"",cellIdx:-1,view:null,rowNode:null,rowIdx:-1,expandoCell:null,level:0,templateString:_4,_toggleRows:function(_5,_6){
if(!_5||!this.rowNode){
return;
}
if(_1.query("table.dojoxGridRowTableNeedsRowUpdate").length){
if(this._initialized){
this.view.grid.updateRow(this.rowIdx);
}
return;
}
var _7=this;
var g=this.view.grid;
if(g.treeModel){
var p=this._tableRow?_1.attr(this._tableRow,"dojoxTreeGridPath"):"";
if(p){
_1.query("tr[dojoxTreeGridPath^=\""+p+"/\"]",this.rowNode).forEach(function(n){
var en=_1.query(".dojoxGridExpando",n)[0];
if(en&&en.parentNode&&en.parentNode.parentNode&&!_1.hasClass(en.parentNode.parentNode,"dojoxGridNoChildren")){
var ew=_2.byNode(en);
if(ew){
ew._toggleRows(_5,ew.open&&_6);
}
}
n.style.display=_6?"":"none";
});
}
}else{
_1.query("tr."+_5,this.rowNode).forEach(function(n){
if(_1.hasClass(n,"dojoxGridExpandoRow")){
var en=_1.query(".dojoxGridExpando",n)[0];
if(en){
var ew=_2.byNode(en);
var _8=ew?ew.toggleClass:en.getAttribute("toggleClass");
var _9=ew?ew.open:_7.expandoCell.getOpenState(en.getAttribute("itemId"));
_7._toggleRows(_8,_9&&_6);
}
}
n.style.display=_6?"":"none";
});
}
},setOpen:function(_a){
if(_a&&_1.hasClass(this.domNode,"dojoxGridExpandoLoading")){
_a=false;
}
var _b=this.view;
var _c=_b.grid;
var _d=_c.store;
var _e=_c.treeModel;
var d=this;
var _f=this.rowIdx;
var me=_c._by_idx[_f];
if(!me){
return;
}
if(_e&&!this._loadedChildren){
if(_a){
var itm=_c.getItem(_1.attr(this._tableRow,"dojoxTreeGridPath"));
if(itm){
this.expandoInner.innerHTML="o";
_1.addClass(this.domNode,"dojoxGridExpandoLoading");
_e.getChildren(itm,function(_10){
d._loadedChildren=true;
d._setOpen(_a);
});
}else{
this._setOpen(_a);
}
}else{
this._setOpen(_a);
}
}else{
if(!_e&&_d){
if(_a){
var _11=_c._by_idx[this.rowIdx];
if(_11&&!_d.isItemLoaded(_11.item)){
this.expandoInner.innerHTML="o";
_1.addClass(this.domNode,"dojoxGridExpandoLoading");
_d.loadItem({item:_11.item,onItem:_1.hitch(this,function(i){
var _12=_d.getIdentity(i);
_c._by_idty[_12]=_c._by_idx[this.rowIdx]={idty:_12,item:i};
this._setOpen(_a);
})});
}else{
this._setOpen(_a);
}
}else{
this._setOpen(_a);
}
}else{
this._setOpen(_a);
}
}
},_setOpen:function(_13){
if(_13&&this._tableRow&&_1.hasClass(this._tableRow,"dojoxGridNoChildren")){
this._setOpen(false);
return;
}
this.expandoInner.innerHTML=_13?"-":"+";
_1.removeClass(this.domNode,"dojoxGridExpandoLoading");
_1.toggleClass(this.domNode,"dojoxGridExpandoOpened",_13);
if(this._tableRow){
_1.toggleClass(this._tableRow,"dojoxGridRowCollapsed",!_13);
var _14=_1.attr(this._tableRow,"dojoxTreeGridBaseClasses");
var _15="";
if(_13){
_15=_1.trim((" "+_14+" ").replace(" dojoxGridRowCollapsed "," "));
}else{
if((" "+_14+" ").indexOf(" dojoxGridRowCollapsed ")<0){
_15=_14+(_14?" ":"")+"dojoxGridRowCollapsed";
}else{
_15=_14;
}
}
_1.attr(this._tableRow,"dojoxTreeGridBaseClasses",_15);
}
var _16=(this.open!==_13);
this.open=_13;
if(this.expandoCell&&this.itemId){
this.expandoCell.openStates[this.itemId]=_13;
}
var v=this.view;
var g=v.grid;
if(this.toggleClass&&_16){
if(!this._tableRow||!this._tableRow.style.display){
this._toggleRows(this.toggleClass,_13);
}
}
if(v&&this._initialized&&this.rowIdx>=0){
g.rowHeightChanged(this.rowIdx);
g.postresize();
v.hasVScrollbar(true);
}
this._initialized=true;
},onToggle:function(e){
this.setOpen(!this.open);
_1.stopEvent(e);
},setRowNode:function(_17,_18,_19){
if(this.cellIdx<0||!this.itemId){
return false;
}
this._initialized=false;
this.view=_19;
this.rowNode=_18;
this.rowIdx=_17;
this.expandoCell=_19.structure.cells[0][this.cellIdx];
var d=this.domNode;
if(d&&d.parentNode&&d.parentNode.parentNode){
this._tableRow=d.parentNode.parentNode;
}
this.open=this.expandoCell.getOpenState(this.itemId);
if(_19.grid.treeModel){
_1.style(this.domNode,"marginLeft",(this.level*18)+"px");
if(this.domNode.parentNode){
_1.style(this.domNode.parentNode,"backgroundPosition",((this.level*18)+(3))+"px");
}
}
this.setOpen(this.open);
return true;
}});
_1.declare("dojox.grid._TreeContentBuilder",_3.grid._ContentBuilder,{generateHtml:function(_1a,_1b){
var _1c=this.getTableArray(),v=this.view,row=v.structure.cells[0],_1d=this.grid.getItem(_1b),_1e=this.grid,_1f=this.grid.store;
_3.grid.util.fire(this.view,"onBeforeRow",[_1b,[row]]);
var _20=function(_21,_22,_23,_24,_25,_26){
if(!_26){
if(_1c[0].indexOf("dojoxGridRowTableNeedsRowUpdate")==-1){
_1c[0]=_1c[0].replace("dojoxGridRowTable","dojoxGridRowTable dojoxGridRowTableNeedsRowUpdate");
}
return;
}
var _27=_1c.length;
_24=_24||[];
var _28=_24.join("|");
var _29=_24[_24.length-1];
var _2a=_29+(_23?" dojoxGridSummaryRow":"");
var _2b="";
if(_1e.treeModel&&_22&&!_1e.treeModel.mayHaveChildren(_22)){
_2a+=" dojoxGridNoChildren";
}
_1c.push("<tr style=\""+_2b+"\" class=\""+_2a+"\" dojoxTreeGridPath=\""+_25.join("/")+"\" dojoxTreeGridBaseClasses=\""+_2a+"\">");
var _2c=_21+1;
var _2d=null;
for(var i=0,_2e;(_2e=row[i]);i++){
var m=_2e.markup,cc=_2e.customClasses=[],cs=_2e.customStyles=[];
m[5]=_2e.formatAtLevel(_25,_22,_21,_23,_29,cc);
m[1]=cc.join(" ");
m[3]=cs.join(";");
_1c.push.apply(_1c,m);
if(!_2d&&_2e.level===_2c&&_2e.parentCell){
_2d=_2e.parentCell;
}
}
_1c.push("</tr>");
if(_22&&_1f&&_1f.isItem(_22)){
var _2f=_1f.getIdentity(_22);
if(typeof _1e._by_idty_paths[_2f]=="undefined"){
_1e._by_idty_paths[_2f]=_25.join("/");
}
}
var _30;
var _31;
var _32;
var _33;
var _34=_25.concat([]);
if(_1e.treeModel&&_22){
if(_1e.treeModel.mayHaveChildren(_22)){
_30=v.structure.cells[0][_1e.expandoCell||0];
_31=_30.getOpenState(_22)&&_26;
_32=new _3.grid.TreePath(_25.join("/"),_1e);
_33=_32.children(true)||[];
_1.forEach(_33,function(_35,idx){
var _36=_28.split("|");
_36.push(_36[_36.length-1]+"-"+idx);
_34.push(idx);
_20(_2c,_35,false,_36,_34,_31);
_34.pop();
});
}
}else{
if(_22&&_2d&&!_23){
_30=v.structure.cells[0][_2d.level];
_31=_30.getOpenState(_22)&&_26;
if(_1f.hasAttribute(_22,_2d.field)){
var _37=_28.split("|");
_37.pop();
_32=new _3.grid.TreePath(_25.join("/"),_1e);
_33=_32.children(true)||[];
if(_33.length){
_1c[_27]="<tr class=\""+_37.join(" ")+" dojoxGridExpandoRow\" dojoxTreeGridPath=\""+_25.join("/")+"\">";
_1.forEach(_33,function(_38,idx){
var _39=_28.split("|");
_39.push(_39[_39.length-1]+"-"+idx);
_34.push(idx);
_20(_2c,_38,false,_39,_34,_31);
_34.pop();
});
_34.push(_33.length);
_20(_21,_22,true,_24,_34,_31);
}else{
_1c[_27]="<tr class=\""+_29+" dojoxGridNoChildren\" dojoxTreeGridPath=\""+_25.join("/")+"\">";
}
}else{
if(!_1f.isItemLoaded(_22)){
_1c[0]=_1c[0].replace("dojoxGridRowTable","dojoxGridRowTable dojoxGridRowTableNeedsRowUpdate");
}else{
_1c[_27]="<tr class=\""+_29+" dojoxGridNoChildren\" dojoxTreeGridPath=\""+_25.join("/")+"\">";
}
}
}else{
if(_22&&!_23&&_24.length>1){
_1c[_27]="<tr class=\""+_24[_24.length-2]+"\" dojoxTreeGridPath=\""+_25.join("/")+"\">";
}
}
}
};
_20(0,_1d,false,["dojoxGridRowToggle-"+_1b],[_1b],true);
_1c.push("</table>");
return _1c.join("");
},findTarget:function(_3a,_3b){
var n=_3a;
while(n&&(n!=this.domNode)){
if(n.tagName&&n.tagName.toLowerCase()=="tr"){
break;
}
n=n.parentNode;
}
return (n!=this.domNode)?n:null;
},getCellNode:function(_3c,_3d){
var _3e=_1.query("td[idx='"+_3d+"']",_3c)[0];
if(_3e&&_3e.parentNode&&!_1.hasClass(_3e.parentNode,"dojoxGridSummaryRow")){
return _3e;
}
},decorateEvent:function(e){
e.rowNode=this.findRowTarget(e.target);
if(!e.rowNode){
return false;
}
e.rowIndex=_1.attr(e.rowNode,"dojoxTreeGridPath");
this.baseDecorateEvent(e);
e.cell=this.grid.getCell(e.cellIndex);
return true;
}});
_1.declare("dojox.grid._TreeView",[_3.grid._View],{_contentBuilderClass:_3.grid._TreeContentBuilder,_onDndDrop:function(_3f,_40,_41){
if(this.grid&&this.grid.aggregator){
this.grid.aggregator.clearSubtotalCache();
}
this.inherited(arguments);
},postCreate:function(){
this.inherited(arguments);
this.connect(this.grid,"_cleanupExpandoCache","_cleanupExpandoCache");
},_cleanupExpandoCache:function(_42,_43,_44){
if(_42==-1){
return;
}
_1.forEach(this.grid.layout.cells,function(_45){
if(typeof _45["openStates"]!="undefined"){
if(_43 in _45.openStates){
delete _45.openStates[_43];
}
}
});
if(typeof _42=="string"&&_42.indexOf("/")>-1){
var _46=new _3.grid.TreePath(_42,this.grid);
var _47=_46.parent();
while(_47){
_46=_47;
_47=_46.parent();
}
var _48=_46.item();
if(!_48){
return;
}
var _49=this.grid.store.getIdentity(_48);
if(typeof this._expandos[_49]!="undefined"){
for(var i in this._expandos[_49]){
var exp=this._expandos[_49][i];
if(exp){
exp.destroy();
}
delete this._expandos[_49][i];
}
delete this._expandos[_49];
}
}else{
for(var i in this._expandos){
if(typeof this._expandos[i]!="undefined"){
for(var j in this._expandos[i]){
var exp=this._expandos[i][j];
if(exp){
exp.destroy();
}
}
}
}
this._expandos={};
}
},postMixInProperties:function(){
this.inherited(arguments);
this._expandos={};
},onBeforeRow:function(_4a,_4b){
var g=this.grid;
if(g._by_idx&&g._by_idx[_4a]&&g._by_idx[_4a].idty){
var _4c=g._by_idx[_4a].idty;
this._expandos[_4c]=this._expandos[_4c]||{};
}
this.inherited(arguments);
},onAfterRow:function(_4d,_4e,_4f){
_1.forEach(_1.query("span.dojoxGridExpando",_4f),function(n){
if(n&&n.parentNode){
var tc=n.getAttribute("toggleClass");
var _50;
var _51;
var g=this.grid;
if(g._by_idx&&g._by_idx[_4d]&&g._by_idx[_4d].idty){
_50=g._by_idx[_4d].idty;
_51=this._expandos[_50][tc];
}
if(_51){
_1.place(_51.domNode,n,"replace");
_51.itemId=n.getAttribute("itemId");
_51.cellIdx=parseInt(n.getAttribute("cellIdx"),10);
if(isNaN(_51.cellIdx)){
_51.cellIdx=-1;
}
}else{
if(_50){
_51=_1.parser.parse(n.parentNode)[0];
this._expandos[_50][tc]=_51;
}
}
if(_51&&!_51.setRowNode(_4d,_4f,this)){
_51.domNode.parentNode.removeChild(_51.domNode);
}
}
},this);
var alt=false;
var _52=this;
_1.query("tr[dojoxTreeGridPath]",_4f).forEach(function(n){
_1.toggleClass(n,"dojoxGridSubRowAlt",alt);
_1.attr(n,"dojoxTreeGridBaseClasses",n.className);
alt=!alt;
_52.grid.rows.styleRowNode(_1.attr(n,"dojoxTreeGridPath"),n);
});
this.inherited(arguments);
},updateRowStyles:function(_53){
var _54=_1.query("tr[dojoxTreeGridPath='"+_53+"']",this.domNode);
if(_54.length){
this.styleRowNode(_53,_54[0]);
}
},getCellNode:function(_55,_56){
var row=_1.query("tr[dojoxTreeGridPath='"+_55+"']",this.domNode)[0];
if(row){
return this.content.getCellNode(row,_56);
}
},destroy:function(){
this._cleanupExpandoCache();
this.inherited(arguments);
}});
return _3.grid._TreeView;
});
