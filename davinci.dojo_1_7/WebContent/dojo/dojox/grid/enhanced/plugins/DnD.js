/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojox","dojo/dnd/move","dojo/dnd/Source","../_Plugin","./Selector","./Rearrange"],function(_1,_2){
var _3=function(a){
a.sort(function(v1,v2){
return v1-v2;
});
var _4=[[a[0]]];
for(var i=1,j=0;i<a.length;++i){
if(a[i]==a[i-1]+1){
_4[j].push(a[i]);
}else{
_4[++j]=[a[i]];
}
}
return _4;
},_5=function(_6){
var a=_6[0];
for(var i=1;i<_6.length;++i){
a=a.concat(_6[i]);
}
return a;
};
_1.declare("dojox.grid.enhanced.plugins.DnD",_2.grid.enhanced._Plugin,{name:"dnd",_targetAnchorBorderWidth:2,_copyOnly:false,_config:{"row":{"within":true,"in":true,"out":true},"col":{"within":true,"in":true,"out":true},"cell":{"within":true,"in":true,"out":true}},constructor:function(_7,_8){
this.grid=_7;
this._config=_1.clone(this._config);
_8=_1.isObject(_8)?_8:{};
this.setupConfig(_8.dndConfig);
this._copyOnly=!!_8.copyOnly;
this._mixinGrid();
this.selector=_7.pluginMgr.getPlugin("selector");
this.rearranger=_7.pluginMgr.getPlugin("rearrange");
this.rearranger.setArgs(_8);
this._clear();
this._elem=new _2.grid.enhanced.plugins.GridDnDElement(this);
this._source=new _2.grid.enhanced.plugins.GridDnDSource(this._elem.node,{"grid":_7,"dndElem":this._elem,"dnd":this});
this._container=_1.query(".dojoxGridMasterView",this.grid.domNode)[0];
this._initEvents();
},destroy:function(){
this.inherited(arguments);
this._clear();
this._source.destroy();
this._elem.destroy();
this._container=null;
this.grid=null;
this.selector=null;
this.rearranger=null;
this._config=null;
},_mixinGrid:function(){
this.grid.setupDnDConfig=_1.hitch(this,"setupConfig");
this.grid.dndCopyOnly=_1.hitch(this,"copyOnly");
},setupConfig:function(_9){
if(_9&&_1.isObject(_9)){
var _a=["row","col","cell"],_b=["within","in","out"],_c=this._config;
_1.forEach(_a,function(_d){
if(_d in _9){
var t=_9[_d];
if(t&&_1.isObject(t)){
_1.forEach(_b,function(_e){
if(_e in t){
_c[_d][_e]=!!t[_e];
}
});
}else{
_1.forEach(_b,function(_f){
_c[_d][_f]=!!t;
});
}
}
});
_1.forEach(_b,function(_10){
if(_10 in _9){
var m=_9[_10];
if(m&&_1.isObject(m)){
_1.forEach(_a,function(_11){
if(_11 in m){
_c[_11][_10]=!!m[_11];
}
});
}else{
_1.forEach(_a,function(_12){
_c[_12][_10]=!!m;
});
}
}
});
}
},copyOnly:function(_13){
if(typeof _13!="undefined"){
this._copyOnly=!!_13;
}
return this._copyOnly;
},_isOutOfGrid:function(evt){
var _14=_1.position(this.grid.domNode),x=evt.clientX,y=evt.clientY;
return y<_14.y||y>_14.y+_14.h||x<_14.x||x>_14.x+_14.w;
},_onMouseMove:function(evt){
if(this._dndRegion&&!this._dnding&&!this._externalDnd){
this._dnding=true;
this._startDnd(evt);
}else{
if(this._isMouseDown&&!this._dndRegion){
delete this._isMouseDown;
this._oldCursor=_1.style(_1.body(),"cursor");
_1.style(_1.body(),"cursor","not-allowed");
}
var _15=this._isOutOfGrid(evt);
if(!this._alreadyOut&&_15){
this._alreadyOut=true;
if(this._dnding){
this._destroyDnDUI(true,false);
}
this._moveEvent=evt;
this._source.onOutEvent();
}else{
if(this._alreadyOut&&!_15){
this._alreadyOut=false;
if(this._dnding){
this._createDnDUI(evt,true);
}
this._moveEvent=evt;
this._source.onOverEvent();
}
}
}
},_onMouseUp:function(){
if(!this._extDnding&&!this._isSource){
var _16=this._dnding&&!this._alreadyOut;
if(_16&&this._config[this._dndRegion.type]["within"]){
this._rearrange();
}
this._endDnd(_16);
}
_1.style(_1.body(),"cursor",this._oldCursor||"");
delete this._isMouseDown;
},_initEvents:function(){
var g=this.grid,s=this.selector;
this.connect(_1.doc,"onmousemove","_onMouseMove");
this.connect(_1.doc,"onmouseup","_onMouseUp");
this.connect(g,"onCellMouseOver",function(evt){
if(!this._dnding&&!s.isSelecting()&&!evt.ctrlKey){
this._dndReady=s.isSelected("cell",evt.rowIndex,evt.cell.index);
s.selectEnabled(!this._dndReady);
}
});
this.connect(g,"onHeaderCellMouseOver",function(evt){
if(this._dndReady){
s.selectEnabled(true);
}
});
this.connect(g,"onRowMouseOver",function(evt){
if(this._dndReady&&!evt.cell){
s.selectEnabled(true);
}
});
this.connect(g,"onCellMouseDown",function(evt){
if(!evt.ctrlKey&&this._dndReady){
this._dndRegion=this._getDnDRegion(evt.rowIndex,evt.cell.index);
this._isMouseDown=true;
}
});
this.connect(g,"onCellMouseUp",function(evt){
if(!this._dndReady&&!s.isSelecting()&&evt.cell){
this._dndReady=s.isSelected("cell",evt.rowIndex,evt.cell.index);
s.selectEnabled(!this._dndReady);
}
});
this.connect(g,"onCellClick",function(evt){
if(this._dndReady&&!evt.ctrlKey&&!evt.shiftKey){
s.select("cell",evt.rowIndex,evt.cell.index);
}
});
this.connect(g,"onEndAutoScroll",function(_17,_18,_19,_1a,evt){
if(this._dnding){
this._markTargetAnchor(evt);
}
});
this.connect(_1.doc,"onkeydown",function(evt){
if(evt.keyCode==_1.keys.ESCAPE){
this._endDnd(false);
}else{
if(evt.keyCode==_1.keys.CTRL){
s.selectEnabled(true);
this._isCopy=true;
}
}
});
this.connect(_1.doc,"onkeyup",function(evt){
if(evt.keyCode==_1.keys.CTRL){
s.selectEnabled(!this._dndReady);
this._isCopy=false;
}
});
},_clear:function(){
this._dndRegion=null;
this._target=null;
this._moveEvent=null;
this._targetAnchor={};
this._dnding=false;
this._externalDnd=false;
this._isSource=false;
this._alreadyOut=false;
this._extDnding=false;
},_getDnDRegion:function(_1b,_1c){
var s=this.selector,_1d=s._selected,_1e=(!!_1d.cell.length)|(!!_1d.row.length<<1)|(!!_1d.col.length<<2),_1f;
switch(_1e){
case 1:
_1f="cell";
if(!this._config[_1f]["within"]&&!this._config[_1f]["out"]){
return null;
}
var _20=this.grid.layout.cells,_21=function(_22){
var _23=0;
for(var i=_22.min.col;i<=_22.max.col;++i){
if(_20[i].hidden){
++_23;
}
}
return (_22.max.row-_22.min.row+1)*(_22.max.col-_22.min.col+1-_23);
},_24=function(_25,_26){
return _25.row>=_26.min.row&&_25.row<=_26.max.row&&_25.col>=_26.min.col&&_25.col<=_26.max.col;
},_27={max:{row:-1,col:-1},min:{row:Infinity,col:Infinity}};
_1.forEach(_1d[_1f],function(_28){
if(_28.row<_27.min.row){
_27.min.row=_28.row;
}
if(_28.row>_27.max.row){
_27.max.row=_28.row;
}
if(_28.col<_27.min.col){
_27.min.col=_28.col;
}
if(_28.col>_27.max.col){
_27.max.col=_28.col;
}
});
if(_1.some(_1d[_1f],function(_29){
return _29.row==_1b&&_29.col==_1c;
})){
if(_21(_27)==_1d[_1f].length&&_1.every(_1d[_1f],function(_2a){
return _24(_2a,_27);
})){
return {"type":_1f,"selected":[_27],"handle":{"row":_1b,"col":_1c}};
}
}
return null;
case 2:
case 4:
_1f=_1e==2?"row":"col";
if(!this._config[_1f]["within"]&&!this._config[_1f]["out"]){
return null;
}
var res=s.getSelected(_1f);
if(res.length){
return {"type":_1f,"selected":_3(res),"handle":_1e==2?_1b:_1c};
}
return null;
}
return null;
},_startDnd:function(evt){
this._createDnDUI(evt);
},_endDnd:function(_2b){
this._destroyDnDUI(false,_2b);
this._clear();
},_createDnDUI:function(evt,_2c){
var _2d=_1.position(this.grid.views.views[0].domNode);
_1.style(this._container,"height",_2d.h+"px");
try{
if(!_2c){
this._createSource(evt);
}
this._createMoveable(evt);
this._oldCursor=_1.style(_1.body(),"cursor");
_1.style(_1.body(),"cursor","default");
}
catch(e){
console.warn("DnD._createDnDUI() error:",e);
}
},_destroyDnDUI:function(_2e,_2f){
try{
if(_2f){
this._destroySource();
}
this._unmarkTargetAnchor();
if(!_2e){
this._destroyMoveable();
}
_1.style(_1.body(),"cursor",this._oldCursor);
}
catch(e){
console.warn("DnD._destroyDnDUI() error:",this.grid.id,e);
}
},_createSource:function(evt){
this._elem.createDnDNodes(this._dndRegion);
var m=_1.dnd.manager();
var _30=m.makeAvatar;
m._dndPlugin=this;
m.makeAvatar=function(){
var _31=new _2.grid.enhanced.plugins.GridDnDAvatar(m);
delete m._dndPlugin;
return _31;
};
m.startDrag(this._source,this._elem.getDnDNodes(),evt.ctrlKey);
m.makeAvatar=_30;
m.onMouseMove(evt);
},_destroySource:function(){
_1.publish("/dnd/cancel");
},_createMoveable:function(evt){
if(!this._markTagetAnchorHandler){
this._markTagetAnchorHandler=this.connect(_1.doc,"onmousemove","_markTargetAnchor");
}
},_destroyMoveable:function(){
this.disconnect(this._markTagetAnchorHandler);
delete this._markTagetAnchorHandler;
},_calcColTargetAnchorPos:function(evt,_32){
var i,_33,_34,_35,ex=evt.clientX,_36=this.grid.layout.cells,ltr=_1._isBodyLtr(),_37=this._getVisibleHeaders();
for(i=0;i<_37.length;++i){
_33=_1.position(_37[i].node);
if(ltr?((i===0||ex>=_33.x)&&ex<_33.x+_33.w):((i===0||ex<_33.x+_33.w)&&ex>=_33.x)){
_34=_33.x+(ltr?0:_33.w);
break;
}else{
if(ltr?(i===_37.length-1&&ex>=_33.x+_33.w):(i===_37.length-1&&ex<_33.x)){
++i;
_34=_33.x+(ltr?_33.w:0);
break;
}
}
}
if(i<_37.length){
_35=_37[i].cell.index;
if(this.selector.isSelected("col",_35)&&this.selector.isSelected("col",_35-1)){
var _38=this._dndRegion.selected;
for(i=0;i<_38.length;++i){
if(_1.indexOf(_38[i],_35)>=0){
_35=_38[i][0];
_33=_1.position(_36[_35].getHeaderNode());
_34=_33.x+(ltr?0:_33.w);
break;
}
}
}
}else{
_35=_36.length;
}
this._target=_35;
return _34-_32.x;
},_calcRowTargetAnchorPos:function(evt,_39){
var g=this.grid,top,i=0,_3a=g.layout.cells;
while(_3a[i].hidden){
++i;
}
var _3b=g.layout.cells[i],_3c=g.scroller.firstVisibleRow,_3d=_1.position(_3b.getNode(_3c));
while(_3d.y+_3d.h<evt.clientY){
if(++_3c>=g.rowCount){
break;
}
_3d=_1.position(_3b.getNode(_3c));
}
if(_3c<g.rowCount){
if(this.selector.isSelected("row",_3c)&&this.selector.isSelected("row",_3c-1)){
var _3e=this._dndRegion.selected;
for(i=0;i<_3e.length;++i){
if(_1.indexOf(_3e[i],_3c)>=0){
_3c=_3e[i][0];
_3d=_1.position(_3b.getNode(_3c));
break;
}
}
}
top=_3d.y;
}else{
top=_3d.y+_3d.h;
}
this._target=_3c;
return top-_39.y;
},_calcCellTargetAnchorPos:function(evt,_3f,_40){
var s=this._dndRegion.selected[0],_41=this._dndRegion.handle,g=this.grid,ltr=_1._isBodyLtr(),_42=g.layout.cells,_43,_44,_45,_46,_47,_48,_49,top,_4a,_4b,i,_4c=_41.col-s.min.col,_4d=s.max.col-_41.col,_4e,_4f;
if(!_40.childNodes.length){
_4e=_1.create("div",{"class":"dojoxGridCellBorderLeftTopDIV"},_40);
_4f=_1.create("div",{"class":"dojoxGridCellBorderRightBottomDIV"},_40);
}else{
_4e=_1.query(".dojoxGridCellBorderLeftTopDIV",_40)[0];
_4f=_1.query(".dojoxGridCellBorderRightBottomDIV",_40)[0];
}
for(i=s.min.col+1;i<_41.col;++i){
if(_42[i].hidden){
--_4c;
}
}
for(i=_41.col+1;i<s.max.col;++i){
if(_42[i].hidden){
--_4d;
}
}
_46=this._getVisibleHeaders();
for(i=_4c;i<_46.length-_4d;++i){
_43=_1.position(_46[i].node);
if((evt.clientX>=_43.x&&evt.clientX<_43.x+_43.w)||(i==_4c&&(ltr?evt.clientX<_43.x:evt.clientX>=_43.x+_43.w))||(i==_46.length-_4d-1&&(ltr?evt.clientX>=_43.x+_43.w:evt<_43.x))){
_4a=_46[i-_4c];
_4b=_46[i+_4d];
_44=_1.position(_4a.node);
_45=_1.position(_4b.node);
_4a=_4a.cell.index;
_4b=_4b.cell.index;
_49=ltr?_44.x:_45.x;
_48=ltr?(_45.x+_45.w-_44.x):(_44.x+_44.w-_45.x);
break;
}
}
i=0;
while(_42[i].hidden){
++i;
}
var _50=_42[i],_51=g.scroller.firstVisibleRow,_52=_1.position(_50.getNode(_51));
while(_52.y+_52.h<evt.clientY){
if(++_51<g.rowCount){
_52=_1.position(_50.getNode(_51));
}else{
break;
}
}
var _53=_51>=_41.row-s.min.row?_51-_41.row+s.min.row:0;
var _54=_53+s.max.row-s.min.row;
if(_54>=g.rowCount){
_54=g.rowCount-1;
_53=_54-s.max.row+s.min.row;
}
_44=_1.position(_50.getNode(_53));
_45=_1.position(_50.getNode(_54));
top=_44.y;
_47=_45.y+_45.h-_44.y;
this._target={"min":{"row":_53,"col":_4a},"max":{"row":_54,"col":_4b}};
var _55=(_1.marginBox(_4e).w-_1.contentBox(_4e).w)/2;
var _56=_1.position(_42[_4a].getNode(_53));
_1.style(_4e,{"width":(_56.w-_55)+"px","height":(_56.h-_55)+"px"});
var _57=_1.position(_42[_4b].getNode(_54));
_1.style(_4f,{"width":(_57.w-_55)+"px","height":(_57.h-_55)+"px"});
return {h:_47,w:_48,l:_49-_3f.x,t:top-_3f.y};
},_markTargetAnchor:function(evt){
try{
var t=this._dndRegion.type;
if(this._alreadyOut||(this._dnding&&!this._config[t]["within"])||(this._extDnding&&!this._config[t]["in"])){
return;
}
var _58,_59,_5a,top,_5b=this._targetAnchor[t],pos=_1.position(this._container);
if(!_5b){
_5b=this._targetAnchor[t]=_1.create("div",{"class":(t=="cell")?"dojoxGridCellBorderDIV":"dojoxGridBorderDIV"});
_1.style(_5b,"display","none");
this._container.appendChild(_5b);
}
switch(t){
case "col":
_58=pos.h;
_59=this._targetAnchorBorderWidth;
_5a=this._calcColTargetAnchorPos(evt,pos);
top=0;
break;
case "row":
_58=this._targetAnchorBorderWidth;
_59=pos.w;
_5a=0;
top=this._calcRowTargetAnchorPos(evt,pos);
break;
case "cell":
var _5c=this._calcCellTargetAnchorPos(evt,pos,_5b);
_58=_5c.h;
_59=_5c.w;
_5a=_5c.l;
top=_5c.t;
}
if(typeof _58=="number"&&typeof _59=="number"&&typeof _5a=="number"&&typeof top=="number"){
_1.style(_5b,{"height":_58+"px","width":_59+"px","left":_5a+"px","top":top+"px"});
_1.style(_5b,"display","");
}else{
this._target=null;
}
}
catch(e){
console.warn("DnD._markTargetAnchor() error:",e);
}
},_unmarkTargetAnchor:function(){
if(this._dndRegion){
var _5d=this._targetAnchor[this._dndRegion.type];
if(_5d){
_1.style(this._targetAnchor[this._dndRegion.type],"display","none");
}
}
},_getVisibleHeaders:function(){
return _1.map(_1.filter(this.grid.layout.cells,function(_5e){
return !_5e.hidden;
}),function(_5f){
return {"node":_5f.getHeaderNode(),"cell":_5f};
});
},_rearrange:function(){
if(this._target===null){
return;
}
var t=this._dndRegion.type;
var _60=this._dndRegion.selected;
if(t==="cell"){
this.rearranger[(this._isCopy||this._copyOnly)?"copyCells":"moveCells"](_60[0],this._target);
}else{
this.rearranger[t=="col"?"moveColumns":"moveRows"](_5(_60),this._target);
}
this._target=null;
},onDraggingOver:function(_61){
if(!this._dnding&&_61){
_61._isSource=true;
this._extDnding=true;
if(!this._externalDnd){
this._externalDnd=true;
this._dndRegion=this._mapRegion(_61.grid,_61._dndRegion);
}
this._createDnDUI(this._moveEvent,true);
this.grid.pluginMgr.getPlugin("autoScroll").readyForAutoScroll=true;
}
},_mapRegion:function(_62,_63){
if(_63.type==="cell"){
var _64=_63.selected[0];
var _65=this.grid.layout.cells;
var _66=_62.layout.cells;
var c,cnt=0;
for(c=_64.min.col;c<=_64.max.col;++c){
if(!_66[c].hidden){
++cnt;
}
}
for(c=0;cnt>0;++c){
if(!_65[c].hidden){
--cnt;
}
}
var _67=_1.clone(_63);
_67.selected[0].min.col=0;
_67.selected[0].max.col=c-1;
for(c=_64.min.col;c<=_63.handle.col;++c){
if(!_66[c].hidden){
++cnt;
}
}
for(c=0;cnt>0;++c){
if(!_65[c].hidden){
--cnt;
}
}
_67.handle.col=c;
}
return _63;
},onDraggingOut:function(_68){
if(this._externalDnd){
this._extDnding=false;
this._destroyDnDUI(true,false);
if(_68){
_68._isSource=false;
}
}
},onDragIn:function(_69,_6a){
var _6b=false;
if(this._target!==null){
var _6c=_69._dndRegion.type;
var _6d=_69._dndRegion.selected;
switch(_6c){
case "cell":
this.rearranger.changeCells(_69.grid,_6d[0],this._target);
break;
case "row":
var _6e=_5(_6d);
this.rearranger.insertRows(_69.grid,_6e,this._target);
break;
}
_6b=true;
}
this._endDnd(true);
if(_69.onDragOut){
_69.onDragOut(_6b&&!_6a);
}
},onDragOut:function(_6f){
if(_6f&&!this._copyOnly){
var _70=this._dndRegion.type;
var _71=this._dndRegion.selected;
switch(_70){
case "cell":
this.rearranger.clearCells(_71[0]);
break;
case "row":
this.rearranger.removeRows(_5(_71));
break;
}
}
this._endDnd(true);
},_canAccept:function(_72){
if(!_72){
return false;
}
var _73=_72._dndRegion;
var _74=_73.type;
if(!this._config[_74]["in"]||!_72._config[_74]["out"]){
return false;
}
var g=this.grid;
var _75=_73.selected;
var _76=_1.filter(g.layout.cells,function(_77){
return !_77.hidden;
}).length;
var _78=g.rowCount;
var res=true;
switch(_74){
case "cell":
_75=_75[0];
res=g.store.getFeatures()["dojo.data.api.Write"]&&(_75.max.row-_75.min.row)<=_78&&_1.filter(_72.grid.layout.cells,function(_79){
return _79.index>=_75.min.col&&_79.index<=_75.max.col&&!_79.hidden;
}).length<=_76;
case "row":
if(_72._allDnDItemsLoaded()){
return res;
}
}
return false;
},_allDnDItemsLoaded:function(){
if(this._dndRegion){
var _7a=this._dndRegion.type,_7b=this._dndRegion.selected,_7c=[];
switch(_7a){
case "cell":
for(var i=_7b[0].min.row,max=_7b[0].max.row;i<=max;++i){
_7c.push(i);
}
break;
case "row":
_7c=_5(_7b);
break;
default:
return false;
}
var _7d=this.grid._by_idx;
return _1.every(_7c,function(_7e){
return !!_7d[_7e];
});
}
return false;
}});
_1.declare("dojox.grid.enhanced.plugins.GridDnDElement",null,{constructor:function(_7f){
this.plugin=_7f;
this.node=_1.create("div");
this._items={};
},destroy:function(){
this.plugin=null;
_1.destroy(this.node);
this.node=null;
this._items=null;
},createDnDNodes:function(_80){
this.destroyDnDNodes();
var _81=["grid/"+_80.type+"s"];
var _82=this.plugin.grid.id+"_dndItem";
_1.forEach(_80.selected,function(_83,i){
var id=_82+i;
this._items[id]={"type":_81,"data":_83,"dndPlugin":this.plugin};
this.node.appendChild(_1.create("div",{"id":id}));
},this);
},getDnDNodes:function(){
return _1.map(this.node.childNodes,function(_84){
return _84;
});
},destroyDnDNodes:function(){
_1.empty(this.node);
this._items={};
},getItem:function(_85){
return this._items[_85];
}});
_1.declare("dojox.grid.enhanced.plugins.GridDnDSource",_1.dnd.Source,{accept:["grid/cells","grid/rows","grid/cols"],constructor:function(_86,_87){
this.grid=_87.grid;
this.dndElem=_87.dndElem;
this.dndPlugin=_87.dnd;
this.sourcePlugin=null;
},destroy:function(){
this.inherited(arguments);
this.grid=null;
this.dndElem=null;
this.dndPlugin=null;
this.sourcePlugin=null;
},getItem:function(_88){
return this.dndElem.getItem(_88);
},checkAcceptance:function(_89,_8a){
if(this!=_89&&_8a[0]){
var _8b=_89.getItem(_8a[0].id);
if(_8b.dndPlugin){
var _8c=_8b.type;
for(var j=0;j<_8c.length;++j){
if(_8c[j] in this.accept){
if(this.dndPlugin._canAccept(_8b.dndPlugin)){
this.sourcePlugin=_8b.dndPlugin;
}else{
return false;
}
break;
}
}
}else{
if("grid/rows" in this.accept){
var _8d=[];
_1.forEach(_8a,function(_8e){
var _8f=_89.getItem(_8e.id);
if(_8f.data&&_1.indexOf(_8f.type,"grid/rows")>=0){
var _90=_8f.data;
if(typeof _8f.data=="string"){
_90=_1.fromJson(_8f.data);
}
if(_90){
_8d.push(_90);
}
}
});
if(_8d.length){
this.sourcePlugin={_dndRegion:{type:"row",selected:[_8d]}};
}else{
return false;
}
}
}
}
return this.inherited(arguments);
},onDraggingOver:function(){
this.dndPlugin.onDraggingOver(this.sourcePlugin);
},onDraggingOut:function(){
this.dndPlugin.onDraggingOut(this.sourcePlugin);
},onDndDrop:function(_91,_92,_93,_94){
this.onDndCancel();
if(this!=_91&&this==_94){
this.dndPlugin.onDragIn(this.sourcePlugin,_93);
}
}});
_1.declare("dojox.grid.enhanced.plugins.GridDnDAvatar",_1.dnd.Avatar,{construct:function(){
this._itemType=this.manager._dndPlugin._dndRegion.type;
this._itemCount=this._getItemCount();
this.isA11y=_1.hasClass(_1.body(),"dijit_a11y");
var a=_1.create("table",{"border":"0","cellspacing":"0","class":"dojoxGridDndAvatar","style":{position:"absolute",zIndex:"1999",margin:"0px"}}),_95=this.manager.source,b=_1.create("tbody",null,a),tr=_1.create("tr",null,b),td=_1.create("td",{"class":"dojoxGridDnDIcon"},tr);
if(this.isA11y){
_1.create("span",{"id":"a11yIcon","innerHTML":this.manager.copy?"+":"<"},td);
}
td=_1.create("td",{"class":"dojoxGridDnDItemIcon "+this._getGridDnDIconClass()},tr);
td=_1.create("td",null,tr);
_1.create("span",{"class":"dojoxGridDnDItemCount","innerHTML":_95.generateText?this._generateText():""},td);
_1.style(tr,{"opacity":0.9});
this.node=a;
},_getItemCount:function(){
var _96=this.manager._dndPlugin._dndRegion.selected,_97=0;
switch(this._itemType){
case "cell":
_96=_96[0];
var _98=this.manager._dndPlugin.grid.layout.cells,_99=_96.max.col-_96.min.col+1,_9a=_96.max.row-_96.min.row+1;
if(_99>1){
for(var i=_96.min.col;i<=_96.max.col;++i){
if(_98[i].hidden){
--_99;
}
}
}
_97=_99*_9a;
break;
case "row":
case "col":
_97=_5(_96).length;
}
return _97;
},_getGridDnDIconClass:function(){
return {"row":["dojoxGridDnDIconRowSingle","dojoxGridDnDIconRowMulti"],"col":["dojoxGridDnDIconColSingle","dojoxGridDnDIconColMulti"],"cell":["dojoxGridDnDIconCellSingle","dojoxGridDnDIconCellMulti"]}[this._itemType][this._itemCount==1?0:1];
},_generateText:function(){
return "("+this._itemCount+")";
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.DnD,{"dependency":["selector","rearrange"]});
return _2.grid.enhanced.plugins.DnD;
});
