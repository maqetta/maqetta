/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/CssRuleStore",["dojo","dojox","dojo/data/util/sorter","dojo/data/util/filter","dojox/data/css"],function(_1,_2){
_1.declare("dojox.data.CssRuleStore",null,{_storeRef:"_S",_labelAttribute:"selector",_cache:null,_browserMap:null,_cName:"dojox.data.CssRuleStore",constructor:function(_3){
if(_3){
_1.mixin(this,_3);
}
this._cache={};
this._allItems=null;
this._waiting=[];
this.gatherHandle=null;
var _4=this;
function _5(){
try{
_4.context=_2.data.css.determineContext(_4.context);
if(_4.gatherHandle){
clearInterval(_4.gatherHandle);
_4.gatherHandle=null;
}
while(_4._waiting.length){
var _6=_4._waiting.pop();
_2.data.css.rules.forEach(_6.forFunc,null,_4.context);
_6.finishFunc();
}
}
catch(e){
}
};
this.gatherHandle=setInterval(_5,250);
},setContext:function(_7){
if(_7){
this.close();
this.context=_2.data.css.determineContext(_7);
}
},getFeatures:function(){
return {"dojo.data.api.Read":true};
},isItem:function(_8){
if(_8&&_8[this._storeRef]==this){
return true;
}
return false;
},hasAttribute:function(_9,_a){
this._assertIsItem(_9);
this._assertIsAttribute(_a);
var _b=this.getAttributes(_9);
if(_1.indexOf(_b,_a)!=-1){
return true;
}
return false;
},getAttributes:function(_c){
this._assertIsItem(_c);
var _d=["selector","classes","rule","style","cssText","styleSheet","parentStyleSheet","parentStyleSheetHref"];
var _e=_c.rule.style;
if(_e){
var _f;
for(_f in _e){
_d.push("style."+_f);
}
}
return _d;
},getValue:function(_10,_11,_12){
var _13=this.getValues(_10,_11);
var _14=_12;
if(_13&&_13.length>0){
return _13[0];
}
return _12;
},getValues:function(_15,_16){
this._assertIsItem(_15);
this._assertIsAttribute(_16);
var _17=null;
if(_16==="selector"){
_17=_15.rule["selectorText"];
if(_17&&_1.isString(_17)){
_17=_17.split(",");
}
}else{
if(_16==="classes"){
_17=_15.classes;
}else{
if(_16==="rule"){
_17=_15.rule.rule;
}else{
if(_16==="style"){
_17=_15.rule.style;
}else{
if(_16==="cssText"){
if(_1.isIE){
if(_15.rule.style){
_17=_15.rule.style.cssText;
if(_17){
_17="{ "+_17.toLowerCase()+" }";
}
}
}else{
_17=_15.rule.cssText;
if(_17){
_17=_17.substring(_17.indexOf("{"),_17.length);
}
}
}else{
if(_16==="styleSheet"){
_17=_15.rule.styleSheet;
}else{
if(_16==="parentStyleSheet"){
_17=_15.rule.parentStyleSheet;
}else{
if(_16==="parentStyleSheetHref"){
if(_15.href){
_17=_15.href;
}
}else{
if(_16.indexOf("style.")===0){
var _18=_16.substring(_16.indexOf("."),_16.length);
_17=_15.rule.style[_18];
}else{
_17=[];
}
}
}
}
}
}
}
}
}
if(_17!==undefined){
if(!_1.isArray(_17)){
_17=[_17];
}
}
return _17;
},getLabel:function(_19){
this._assertIsItem(_19);
return this.getValue(_19,this._labelAttribute);
},getLabelAttributes:function(_1a){
return [this._labelAttribute];
},containsValue:function(_1b,_1c,_1d){
var _1e=undefined;
if(typeof _1d==="string"){
_1e=_1.data.util.filter.patternToRegExp(_1d,false);
}
return this._containsValue(_1b,_1c,_1d,_1e);
},isItemLoaded:function(_1f){
return this.isItem(_1f);
},loadItem:function(_20){
this._assertIsItem(_20.item);
},fetch:function(_21){
_21=_21||{};
if(!_21.store){
_21.store=this;
}
var _22=_21.scope||_1.global;
if(this._pending&&this._pending.length>0){
this._pending.push({request:_21,fetch:true});
}else{
this._pending=[{request:_21,fetch:true}];
this._fetch(_21);
}
return _21;
},_fetch:function(_23){
var _24=_23.scope||_1.global;
if(this._allItems===null){
this._allItems={};
try{
if(this.gatherHandle){
this._waiting.push({"forFunc":_1.hitch(this,this._handleRule),"finishFunc":_1.hitch(this,this._handleReturn)});
}else{
_2.data.css.rules.forEach(_1.hitch(this,this._handleRule),null,this.context);
this._handleReturn();
}
}
catch(e){
if(_23.onError){
_23.onError.call(_24,e,_23);
}
}
}else{
this._handleReturn();
}
},_handleRule:function(_25,_26,_27){
var _28=_25["selectorText"];
var s=_28.split(" ");
var _29=[];
for(var j=0;j<s.length;j++){
var tmp=s[j];
var _2a=tmp.indexOf(".");
if(tmp&&tmp.length>0&&_2a!==-1){
var _2b=tmp.indexOf(",")||tmp.indexOf("[");
tmp=tmp.substring(_2a,((_2b!==-1&&_2b>_2a)?_2b:tmp.length));
_29.push(tmp);
}
}
var _2c={};
_2c.rule=_25;
_2c.styleSheet=_26;
_2c.href=_27;
_2c.classes=_29;
_2c[this._storeRef]=this;
if(!this._allItems[_28]){
this._allItems[_28]=[];
}
this._allItems[_28].push(_2c);
},_handleReturn:function(){
var _2d=[];
var _2e=[];
var _2f=null;
for(var i in this._allItems){
_2f=this._allItems[i];
for(var j in _2f){
_2e.push(_2f[j]);
}
}
var _30;
while(this._pending.length){
_30=this._pending.pop();
_30.request._items=_2e;
_2d.push(_30);
}
while(_2d.length){
_30=_2d.pop();
this._handleFetchReturn(_30.request);
}
},_handleFetchReturn:function(_31){
var _32=_31.scope||_1.global;
var _33=[];
var _34="all";
var i;
if(_31.query){
_34=_1.toJson(_31.query);
}
if(this._cache[_34]){
_33=this._cache[_34];
}else{
if(_31.query){
for(i in _31._items){
var _35=_31._items[i];
var _36=_1.isWebKit?true:(_31.queryOptions?_31.queryOptions.ignoreCase:false);
var _37={};
var key;
var _38;
for(key in _31.query){
_38=_31.query[key];
if(typeof _38==="string"){
_37[key]=_1.data.util.filter.patternToRegExp(_38,_36);
}
}
var _39=true;
for(key in _31.query){
_38=_31.query[key];
if(!this._containsValue(_35,key,_38,_37[key])){
_39=false;
}
}
if(_39){
_33.push(_35);
}
}
this._cache[_34]=_33;
}else{
for(i in _31._items){
_33.push(_31._items[i]);
}
}
}
var _3a=_33.length;
if(_31.sort){
_33.sort(_1.data.util.sorter.createSortFunction(_31.sort,this));
}
var _3b=0;
var _3c=_33.length;
if(_31.start>0&&_31.start<_33.length){
_3b=_31.start;
}
if(_31.count&&_31.count){
_3c=_31.count;
}
var _3d=_3b+_3c;
if(_3d>_33.length){
_3d=_33.length;
}
_33=_33.slice(_3b,_3d);
if(_31.onBegin){
_31.onBegin.call(_32,_3a,_31);
}
if(_31.onItem){
if(_1.isArray(_33)){
for(i=0;i<_33.length;i++){
_31.onItem.call(_32,_33[i],_31);
}
if(_31.onComplete){
_31.onComplete.call(_32,null,_31);
}
}
}else{
if(_31.onComplete){
_31.onComplete.call(_32,_33,_31);
}
}
return _31;
},close:function(){
this._cache={};
this._allItems=null;
},_assertIsItem:function(_3e){
if(!this.isItem(_3e)){
throw new Error(this._cName+": Invalid item argument.");
}
},_assertIsAttribute:function(_3f){
if(typeof _3f!=="string"){
throw new Error(this._cName+": Invalid attribute argument.");
}
},_containsValue:function(_40,_41,_42,_43){
return _1.some(this.getValues(_40,_41),function(_44){
if(_44!==null&&!_1.isObject(_44)&&_43){
if(_44.toString().match(_43)){
return true;
}
}else{
if(_42===_44){
return true;
}
}
return false;
});
}});
return _2.data.CssRuleStore;
});
