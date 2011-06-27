/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/grid/enhanced/_PluginManager",["dojo","dojox","./_Events","./_FocusManager"],function(_1,_2){
_1.declare("dojox.grid.enhanced._PluginManager",null,{_options:null,_plugins:null,_connects:null,constructor:function(_3){
this.grid=_3;
this._store=_3.store;
this._options={};
this._plugins=[];
this._connects=[];
this._parseProps(this.grid.plugins);
_3.connect(_3,"_setStore",_1.hitch(this,function(_4){
if(this._store!==_4){
this.forEach("onSetStore",[_4,this._store]);
this._store=_4;
}
}));
},startup:function(){
this.forEach("onStartUp");
},preInit:function(){
this.grid.focus.destroy();
this.grid.focus=new _2.grid.enhanced._FocusManager(this.grid);
new _2.grid.enhanced._Events(this.grid);
this._init(true);
this.forEach("onPreInit");
},postInit:function(){
this._init(false);
_1.forEach(this.grid.views.views,this._initView,this);
this._connects.push(_1.connect(this.grid.views,"addView",_1.hitch(this,this._initView)));
if(this._plugins.length>0){
var _5=this.grid.edit;
if(_5){
_5.styleRow=function(_6){
};
}
}
this.forEach("onPostInit");
},forEach:function(_7,_8){
_1.forEach(this._plugins,function(p){
if(!p||!p[_7]){
return;
}
p[_7].apply(p,_8?_8:[]);
});
},_parseProps:function(_9){
if(!_9){
return;
}
var p,_a={},_b=this._options,_c=this.grid;
var _d=_2.grid.enhanced._PluginManager.registry;
for(p in _9){
if(_9[p]){
this._normalize(p,_9,_d,_a);
}
}
if(_b.dnd||_b.indirectSelection){
_b.columnReordering=false;
}
_1.mixin(_c,_b);
},_normalize:function(p,_e,_f,_10){
if(!_f[p]){
throw new Error("Plugin "+p+" is required.");
}
if(_10[p]){
throw new Error("Recursive cycle dependency is not supported.");
}
var _11=this._options;
if(_11[p]){
return _11[p];
}
_10[p]=true;
_11[p]=_1.mixin({},_f[p],_1.isObject(_e[p])?_e[p]:{});
var _12=_11[p]["dependency"];
if(_12){
if(!_1.isArray(_12)){
_12=_11[p]["dependency"]=[_12];
}
_1.forEach(_12,function(_13){
if(!this._normalize(_13,_e,_f,_10)){
throw new Error("Plugin "+_13+" is required.");
}
},this);
}
delete _10[p];
return _11[p];
},_init:function(pre){
var p,_14,_15=this._options;
for(p in _15){
_14=_15[p]["preInit"];
if((pre?_14:!_14)&&_15[p]["class"]&&!this.pluginExisted(p)){
this.loadPlugin(p);
}
}
},loadPlugin:function(_16){
var _17=this._options[_16];
if(!_17){
return null;
}
var _18=this.getPlugin(_16);
if(_18){
return _18;
}
var _19=_17["dependency"];
_1.forEach(_19,function(_1a){
if(!this.loadPlugin(_1a)){
throw new Error("Plugin "+_1a+" is required.");
}
},this);
var cls=_17["class"];
delete _17["class"];
_18=new this.getPluginClazz(cls)(this.grid,_17);
this._plugins.push(_18);
return _18;
},_initView:function(_1b){
if(!_1b){
return;
}
_2.grid.util.funnelEvents(_1b.contentNode,_1b,"doContentEvent",["mouseup","mousemove"]);
_2.grid.util.funnelEvents(_1b.headerNode,_1b,"doHeaderEvent",["mouseup"]);
},pluginExisted:function(_1c){
return !!this.getPlugin(_1c);
},getPlugin:function(_1d){
var _1e=this._plugins;
_1d=_1d.toLowerCase();
for(var i=0,len=_1e.length;i<len;i++){
if(_1d==_1e[i]["name"].toLowerCase()){
return _1e[i];
}
}
return null;
},getPluginClazz:function(_1f){
if(_1.isFunction(_1f)){
return _1f;
}
var _20="Please make sure Plugin \""+_1f+"\" is existed.";
try{
var cls=_1.getObject(_1f);
if(!cls){
throw new Error(_20);
}
return cls;
}
catch(e){
throw new Error(_20);
}
},isFixedCell:function(_21){
return _21&&(_21.isRowSelector||_21.fixedPos);
},destroy:function(){
_1.forEach(this._connects,_1.disconnect);
this.forEach("destroy");
if(this.grid.unwrap){
this.grid.unwrap();
}
delete this._connects;
delete this._plugins;
delete this._options;
}});
_2.grid.enhanced._PluginManager.registerPlugin=function(_22,_23){
if(!_22){
console.warn("Failed to register plugin, class missed!");
return;
}
var cls=_2.grid.enhanced._PluginManager;
cls.registry=cls.registry||{};
cls.registry[_22.prototype.name]=_1.mixin({"class":_22},(_23?_23:{}));
};
return _2.grid.enhanced._PluginManager;
});
