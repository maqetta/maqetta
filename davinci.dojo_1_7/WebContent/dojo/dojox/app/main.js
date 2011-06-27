/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/app/main",["dojo","dijit","dojox","dojo/cache","dojo/fx","dojox/json/ref","dojo/parser","./scene","dojox/mobile/transition","dojo/on"],function(_1,_2,_3,_4,fx,_5,_6,_7,_8,_9){
var _a=_1.declare([_7],{constructor:function(_b){
this.scenes={};
if(_b.stores){
for(var _c in _b.stores){
if(_c.charAt(0)!=="_"){
var _d=_b.stores[_c].type?_b.stores[_c].type:"dojo.store.Memory";
var _e={};
if(_b.stores[_c].params){
_1.mixin(_e,_b.stores[_c].params);
}
var _f=_1.getObject(_d);
if(_e.data&&_1.isString(_e.data)){
_e.data=_1.getObject(_e.data);
}
_b.stores[_c].store=new _f(_e);
}
}
}
},templateString:"<div></div>",selectedChild:null,baseClass:"application mblView",defaultViewType:_7,buildRendering:function(){
if(this.srcNodeRef===_1.body()){
this.srcNodeRef=_1.create("DIV",{},_1.body());
}
this.inherited(arguments);
}});
function _10(_11,_12,_13,_14){
var _15=_11.modules.concat(_11.dependencies);
if(_11.template){
_15.push("dojo/text!"+"app/"+_11.template);
}
require(_15,function(){
var _16=[_a];
for(var i=0;i<_11.modules.length;i++){
_16.push(arguments[i]);
}
if(_11.template){
var ext={templateString:arguments[arguments.length-1]};
}
App=_1.declare(_16,ext);
_1.ready(function(){
app=App(_11,_12||_1.body());
app.startup();
});
});
};
return function(_17,_18){
if(!_17){
throw Error("App Config Missing");
}
if(_17.validate){
require(["dojox/json/schema","dojox/json/ref","dojo/text!dojox/application/schema/application.json"],function(_19,_1a){
_19=dojox.json.ref.resolveJson(_19);
if(_19.validate(_17,_1a)){
_10(_17,_18);
}
});
}else{
_10(_17,_18);
}
};
});
