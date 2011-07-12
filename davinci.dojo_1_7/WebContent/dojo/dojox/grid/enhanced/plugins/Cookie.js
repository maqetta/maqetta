/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/plugins/Cookie",["dojo","dijit","dojox","dojo/cookie","../_Plugin","../../_RowSelector","../../cells/_base"],function(_1,_2,_3){
var _4=function(_5){
return window.location+"/"+_5.id;
};
var _6=function(_7){
var _8=[];
if(!_1.isArray(_7)){
_7=[_7];
}
_1.forEach(_7,function(_9){
if(_1.isArray(_9)){
_9={"cells":_9};
}
var _a=_9.rows||_9.cells;
if(_1.isArray(_a)){
if(!_1.isArray(_a[0])){
_a=[_a];
}
_1.forEach(_a,function(_b){
if(_1.isArray(_b)){
_1.forEach(_b,function(_c){
_8.push(_c);
});
}
});
}
});
return _8;
};
var _d=function(_e,_f){
if(_1.isArray(_e)){
var _10=_f._setStructureAttr;
_f._setStructureAttr=function(_11){
if(!_f._colWidthLoaded){
_f._colWidthLoaded=true;
var _12=_6(_11);
for(var i=_12.length-1;i>=0;--i){
if(typeof _e[i]=="number"){
_12[i].width=_e[i]+"px";
}
}
}
_10.call(_f,_11);
_f._setStructureAttr=_10;
};
}
};
var _13=function(_14){
return _1.map(_1.filter(_14.layout.cells,function(_15){
return !(_15.isRowSelector||_15 instanceof _3.grid.cells.RowIndex);
}),function(_16){
return _1[_1.isWebKit?"marginBox":"contentBox"](_16.getHeaderNode()).w;
});
};
var _17=function(_18,_19){
if(_18&&_1.every(_18,function(_1a){
return _1.isArray(_1a)&&_1.every(_1a,function(_1b){
return _1.isArray(_1b)&&_1b.length>0;
});
})){
var _1c=_19._setStructureAttr;
var _1d=function(def){
return ("name" in def||"field" in def||"get" in def);
};
var _1e=function(def){
return (def!==null&&_1.isObject(def)&&("cells" in def||"rows" in def||("type" in def&&!_1d(def))));
};
_19._setStructureAttr=function(_1f){
if(!_19._colOrderLoaded){
_19._colOrderLoaded=true;
_19._setStructureAttr=_1c;
_1f=_1.clone(_1f);
if(_1.isArray(_1f)&&!_1.some(_1f,_1e)){
_1f=[{cells:_1f}];
}else{
if(_1e(_1f)){
_1f=[_1f];
}
}
var _20=_6(_1f);
_1.forEach(_1.isArray(_1f)?_1f:[_1f],function(_21,_22){
var _23=_21;
if(_1.isArray(_21)){
_21.splice(0,_21.length);
}else{
delete _21.rows;
_23=_21.cells=[];
}
_1.forEach(_18[_22],function(_24){
_1.forEach(_24,function(_25){
var i,_26;
for(i=0;i<_20.length;++i){
_26=_20[i];
if(_1.toJson({"name":_26.name,"field":_26.field})==_1.toJson(_25)){
break;
}
}
if(i<_20.length){
_23.push(_26);
}
});
});
});
}
_1c.call(_19,_1f);
};
}
};
var _27=function(_28){
var _29=_1.map(_1.filter(_28.views.views,function(_2a){
return !(_2a instanceof _3.grid._RowSelector);
}),function(_2b){
return _1.map(_2b.structure.cells,function(_2c){
return _1.map(_1.filter(_2c,function(_2d){
return !(_2d.isRowSelector||_2d instanceof _3.grid.cells.RowIndex);
}),function(_2e){
return {"name":_2e.name,"field":_2e.field};
});
});
});
return _29;
};
var _2f=function(_30,_31){
try{
if(_1.isObject(_30)){
_31.setSortIndex(_30.idx,_30.asc);
}
}
catch(e){
}
};
var _32=function(_33){
return {idx:_33.getSortIndex(),asc:_33.getSortAsc()};
};
if(!_1.isIE){
_1.addOnWindowUnload(function(){
_1.forEach(_2.findWidgets(_1.body()),function(_34){
if(_34 instanceof _3.grid.EnhancedGrid&&!_34._destroyed){
_34.destroyRecursive();
}
});
});
}
_1.declare("dojox.grid.enhanced.plugins.Cookie",_3.grid.enhanced._Plugin,{name:"cookie",_cookieEnabled:true,constructor:function(_35,_36){
this.grid=_35;
_36=(_36&&_1.isObject(_36))?_36:{};
this.cookieProps=_36.cookieProps;
this._cookieHandlers=[];
this._mixinGrid();
this.addCookieHandler({name:"columnWidth",onLoad:_d,onSave:_13});
this.addCookieHandler({name:"columnOrder",onLoad:_17,onSave:_27});
this.addCookieHandler({name:"sortOrder",onLoad:_2f,onSave:_32});
_1.forEach(this._cookieHandlers,function(_37){
if(_36[_37.name]===false){
_37.enable=false;
}
},this);
},destroy:function(){
this._saveCookie();
this._cookieHandlers=null;
this.inherited(arguments);
},_mixinGrid:function(){
var g=this.grid;
g.addCookieHandler=_1.hitch(this,"addCookieHandler");
g.removeCookie=_1.hitch(this,"removeCookie");
g.setCookieEnabled=_1.hitch(this,"setCookieEnabled");
g.getCookieEnabled=_1.hitch(this,"getCookieEnabled");
},_saveCookie:function(){
if(this.getCookieEnabled()){
var _38={},chs=this._cookieHandlers,_39=this.cookieProps,_3a=_4(this.grid);
for(var i=chs.length-1;i>=0;--i){
if(chs[i].enabled){
_38[chs[i].name]=chs[i].onSave(this.grid);
}
}
_39=_1.isObject(this.cookieProps)?this.cookieProps:{};
_1.cookie(_3a,_1.toJson(_38),_39);
}else{
this.removeCookie();
}
},onPreInit:function(){
var _3b=this.grid,chs=this._cookieHandlers,_3c=_4(_3b),_3d=_1.cookie(_3c);
if(_3d){
_3d=_1.fromJson(_3d);
for(var i=0;i<chs.length;++i){
if(chs[i].name in _3d&&chs[i].enabled){
chs[i].onLoad(_3d[chs[i].name],_3b);
}
}
}
this._cookie=_3d||{};
this._cookieStartedup=true;
},addCookieHandler:function(_3e){
if(_3e.name){
var _3f=function(){
};
_3e.onLoad=_3e.onLoad||_3f;
_3e.onSave=_3e.onSave||_3f;
if(!("enabled" in _3e)){
_3e.enabled=true;
}
for(var i=this._cookieHandlers.length-1;i>=0;--i){
if(this._cookieHandlers[i].name==_3e.name){
this._cookieHandlers.splice(i,1);
}
}
this._cookieHandlers.push(_3e);
if(this._cookieStartedup&&_3e.name in this._cookie){
_3e.onLoad(this._cookie[_3e.name],this.grid);
}
}
},removeCookie:function(){
var key=_4(this.grid);
_1.cookie(key,null,{expires:-1});
},setCookieEnabled:function(_40,_41){
if(arguments.length==2){
var chs=this._cookieHandlers;
for(var i=chs.length-1;i>=0;--i){
if(chs[i].name===_40){
chs[i].enabled=!!_41;
}
}
}else{
this._cookieEnabled=!!_40;
if(!this._cookieEnabled){
this.removeCookie();
}
}
},getCookieEnabled:function(_42){
if(_1.isString(_42)){
var chs=this._cookieHandlers;
for(var i=chs.length-1;i>=0;--i){
if(chs[i].name==_42){
return chs[i].enabled;
}
}
return false;
}
return this._cookieEnabled;
}});
_3.grid.EnhancedGrid.registerPlugin(_3.grid.enhanced.plugins.Cookie,{"preInit":true});
return _3.grid.enhanced.plugins.Cookie;
});
