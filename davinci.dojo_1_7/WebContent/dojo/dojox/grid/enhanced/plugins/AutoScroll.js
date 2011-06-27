/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/AutoScroll",["dojo","dojox","../_Plugin","../../_RowSelector"],function(_1,_2){
_1.declare("dojox.grid.enhanced.plugins.AutoScroll",_2.grid.enhanced._Plugin,{name:"autoScroll",autoScrollInterval:1000,autoScrollMargin:30,constructor:function(_3,_4){
this.grid=_3;
this.readyForAutoScroll=false;
this._scrolling=false;
_4=_1.isObject(_4)?_4:{};
if("interval" in _4){
this.autoScrollInterval=_4.interval;
}
if("margin" in _4){
this.autoScrollMargin=_4.margin;
}
this._initEvents();
this._mixinGrid();
},_initEvents:function(){
var g=this.grid;
this.connect(g,"onCellMouseDown",function(){
this.readyForAutoScroll=true;
});
this.connect(g,"onHeaderCellMouseDown",function(){
this.readyForAutoScroll=true;
});
this.connect(g,"onRowSelectorMouseDown",function(){
this.readyForAutoScroll=true;
});
this.connect(_1.doc,"onmouseup",function(_5){
this._manageAutoScroll(true);
this.readyForAutoScroll=false;
});
this.connect(_1.doc,"onmousemove",function(_6){
if(this.readyForAutoScroll){
this._event=_6;
var _7=_1.position(g.domNode),hh=g._getHeaderHeight(),_8=this.autoScrollMargin,ey=_6.clientY,ex=_6.clientX,gy=_7.y,gx=_7.x,gh=_7.h,gw=_7.w;
if(ex>=gx&&ex<=gx+gw){
if(ey>=gy+hh&&ey<gy+hh+_8){
this._manageAutoScroll(false,true,false);
return;
}else{
if(ey>gy+gh-_8&&ey<=gy+gh){
this._manageAutoScroll(false,true,true);
return;
}else{
if(ey>=gy&&ey<=gy+gh){
var _9=_1.some(g.views.views,function(_a,i){
if(_a instanceof _2.grid._RowSelector){
return false;
}
var _b=_1.position(_a.domNode);
if(ex<_b.x+_8&&ex>=_b.x){
this._manageAutoScroll(false,false,false,_a);
return true;
}else{
if(ex>_b.x+_b.w-_8&&ex<_b.x+_b.w){
this._manageAutoScroll(false,false,true,_a);
return true;
}
}
return false;
},this);
if(_9){
return;
}
}
}
}
}
this._manageAutoScroll(true);
}
});
},_mixinGrid:function(){
var g=this.grid;
g.onStartAutoScroll=function(){
};
g.onEndAutoScroll=function(){
};
},_fireEvent:function(_c,_d){
var g=this.grid;
switch(_c){
case "start":
g.onStartAutoScroll.apply(g,_d);
break;
case "end":
g.onEndAutoScroll.apply(g,_d);
break;
}
},_manageAutoScroll:function(_e,_f,_10,_11){
if(_e){
this._scrolling=false;
clearInterval(this._handler);
}else{
if(!this._scrolling){
this._scrolling=true;
this._fireEvent("start",[_f,_10,_11]);
this._autoScroll(_f,_10,_11);
this._handler=setInterval(_1.hitch(this,"_autoScroll",_f,_10,_11),this.autoScrollInterval);
}
}
},_autoScroll:function(_12,_13,_14){
var g=this.grid,_15=null;
if(_12){
var _16=g.scroller.firstVisibleRow+(_13?1:-1);
if(_16>=0&&_16<g.rowCount){
g.scrollToRow(_16);
_15=_16;
}
}else{
_15=this._scrollColumn(_13,_14);
}
if(_15!==null){
this._fireEvent("end",[_12,_13,_14,_15,this._event]);
}
},_scrollColumn:function(_17,_18){
var _19=_18.scrollboxNode,_1a=null;
if(_19.clientWidth<_19.scrollWidth){
var _1b=_1.filter(this.grid.layout.cells,function(_1c){
return !_1c.hidden;
});
var _1d=_1.position(_18.domNode);
var _1e,_1f,_20,i;
if(_17){
_1e=_19.clientWidth;
for(i=0;i<_1b.length;++i){
_20=_1.position(_1b[i].getHeaderNode());
_1f=_20.x-_1d.x+_20.w;
if(_1f>_1e){
_1a=_1b[i].index;
_19.scrollLeft+=_1f-_1e+10;
break;
}
}
}else{
_1e=0;
for(i=_1b.length-1;i>=0;--i){
_20=_1.position(_1b[i].getHeaderNode());
_1f=_20.x-_1d.x;
if(_1f<_1e){
_1a=_1b[i].index;
_19.scrollLeft+=_1f-_1e-10;
break;
}
}
}
}
return _1a;
}});
_2.grid.EnhancedGrid.registerPlugin(_2.grid.enhanced.plugins.AutoScroll);
return _2.grid.enhanced.plugins.AutoScroll;
});
