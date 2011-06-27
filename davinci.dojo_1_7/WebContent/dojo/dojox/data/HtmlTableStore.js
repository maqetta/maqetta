/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/HtmlTableStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/data/util/filter","dojox/xml/parser"],function(_1,_2){
_1.declare("dojox.data.HtmlTableStore",null,{constructor:function(_3){
_1.deprecated("dojox.data.HtmlTableStore","Please use dojox.data.HtmlStore");
if(_3.url){
if(!_3.tableId){
throw new Error("dojo.data.HtmlTableStore: Cannot instantiate using url without an id!");
}
this.url=_3.url;
this.tableId=_3.tableId;
}else{
if(_3.tableId){
this._rootNode=_1.byId(_3.tableId);
this.tableId=this._rootNode.id;
}else{
this._rootNode=_1.byId(this.tableId);
}
this._getHeadings();
for(var i=0;i<this._rootNode.rows.length;i++){
this._rootNode.rows[i].store=this;
}
}
},url:"",tableId:"",_getHeadings:function(){
this._headings=[];
_1.forEach(this._rootNode.tHead.rows[0].cells,_1.hitch(this,function(th){
this._headings.push(_2.xml.parser.textContent(th));
}));
},_getAllItems:function(){
var _4=[];
for(var i=1;i<this._rootNode.rows.length;i++){
_4.push(this._rootNode.rows[i]);
}
return _4;
},_assertIsItem:function(_5){
if(!this.isItem(_5)){
throw new Error("dojo.data.HtmlTableStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_6){
if(typeof _6!=="string"){
throw new Error("dojo.data.HtmlTableStore: a function was passed an attribute argument that was not an attribute name string");
return -1;
}
return _1.indexOf(this._headings,_6);
},getValue:function(_7,_8,_9){
var _a=this.getValues(_7,_8);
return (_a.length>0)?_a[0]:_9;
},getValues:function(_b,_c){
this._assertIsItem(_b);
var _d=this._assertIsAttribute(_c);
if(_d>-1){
return [_2.xml.parser.textContent(_b.cells[_d])];
}
return [];
},getAttributes:function(_e){
this._assertIsItem(_e);
var _f=[];
for(var i=0;i<this._headings.length;i++){
if(this.hasAttribute(_e,this._headings[i])){
_f.push(this._headings[i]);
}
}
return _f;
},hasAttribute:function(_10,_11){
return this.getValues(_10,_11).length>0;
},containsValue:function(_12,_13,_14){
var _15=undefined;
if(typeof _14==="string"){
_15=_1.data.util.filter.patternToRegExp(_14,false);
}
return this._containsValue(_12,_13,_14,_15);
},_containsValue:function(_16,_17,_18,_19){
var _1a=this.getValues(_16,_17);
for(var i=0;i<_1a.length;++i){
var _1b=_1a[i];
if(typeof _1b==="string"&&_19){
return (_1b.match(_19)!==null);
}else{
if(_18===_1b){
return true;
}
}
}
return false;
},isItem:function(_1c){
if(_1c&&_1c.store&&_1c.store===this){
return true;
}
return false;
},isItemLoaded:function(_1d){
return this.isItem(_1d);
},loadItem:function(_1e){
this._assertIsItem(_1e.item);
},_fetchItems:function(_1f,_20,_21){
if(this._rootNode){
this._finishFetchItems(_1f,_20,_21);
}else{
if(!this.url){
this._rootNode=_1.byId(this.tableId);
this._getHeadings();
for(var i=0;i<this._rootNode.rows.length;i++){
this._rootNode.rows[i].store=this;
}
}else{
var _22={url:this.url,handleAs:"text"};
var _23=this;
var _24=_1.xhrGet(_22);
_24.addCallback(function(_25){
var _26=function(_27,id){
if(_27.id==id){
return _27;
}
if(_27.childNodes){
for(var i=0;i<_27.childNodes.length;i++){
var _28=_26(_27.childNodes[i],id);
if(_28){
return _28;
}
}
}
return null;
};
var d=document.createElement("div");
d.innerHTML=_25;
_23._rootNode=_26(d,_23.tableId);
_23._getHeadings.call(_23);
for(var i=0;i<_23._rootNode.rows.length;i++){
_23._rootNode.rows[i].store=_23;
}
_23._finishFetchItems(_1f,_20,_21);
});
_24.addErrback(function(_29){
_21(_29,_1f);
});
}
}
},_finishFetchItems:function(_2a,_2b,_2c){
var _2d=null;
var _2e=this._getAllItems();
if(_2a.query){
var _2f=_2a.queryOptions?_2a.queryOptions.ignoreCase:false;
_2d=[];
var _30={};
var _31;
var key;
for(key in _2a.query){
_31=_2a.query[key]+"";
if(typeof _31==="string"){
_30[key]=_1.data.util.filter.patternToRegExp(_31,_2f);
}
}
for(var i=0;i<_2e.length;++i){
var _32=true;
var _33=_2e[i];
for(key in _2a.query){
_31=_2a.query[key]+"";
if(!this._containsValue(_33,key,_31,_30[key])){
_32=false;
}
}
if(_32){
_2d.push(_33);
}
}
_2b(_2d,_2a);
}else{
if(_2e.length>0){
_2d=_2e.slice(0,_2e.length);
}
_2b(_2d,_2a);
}
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},close:function(_34){
},getLabel:function(_35){
if(this.isItem(_35)){
return "Table Row #"+this.getIdentity(_35);
}
return undefined;
},getLabelAttributes:function(_36){
return null;
},getIdentity:function(_37){
this._assertIsItem(_37);
if(!_1.isOpera){
return _37.sectionRowIndex;
}else{
return (_1.indexOf(this._rootNode.rows,_37)-1);
}
},getIdentityAttributes:function(_38){
return null;
},fetchItemByIdentity:function(_39){
var _3a=_39.identity;
var _3b=this;
var _3c=null;
var _3d=null;
if(!this._rootNode){
if(!this.url){
this._rootNode=_1.byId(this.tableId);
this._getHeadings();
for(var i=0;i<this._rootNode.rows.length;i++){
this._rootNode.rows[i].store=this;
}
_3c=this._rootNode.rows[_3a+1];
if(_39.onItem){
_3d=_39.scope?_39.scope:_1.global;
_39.onItem.call(_3d,_3c);
}
}else{
var _3e={url:this.url,handleAs:"text"};
var _3f=_1.xhrGet(_3e);
_3f.addCallback(function(_40){
var _41=function(_42,id){
if(_42.id==id){
return _42;
}
if(_42.childNodes){
for(var i=0;i<_42.childNodes.length;i++){
var _43=_41(_42.childNodes[i],id);
if(_43){
return _43;
}
}
}
return null;
};
var d=document.createElement("div");
d.innerHTML=_40;
_3b._rootNode=_41(d,_3b.tableId);
_3b._getHeadings.call(_3b);
for(var i=0;i<_3b._rootNode.rows.length;i++){
_3b._rootNode.rows[i].store=_3b;
}
_3c=_3b._rootNode.rows[_3a+1];
if(_39.onItem){
_3d=_39.scope?_39.scope:_1.global;
_39.onItem.call(_3d,_3c);
}
});
_3f.addErrback(function(_44){
if(_39.onError){
_3d=_39.scope?_39.scope:_1.global;
_39.onError.call(_3d,_44);
}
});
}
}else{
if(this._rootNode.rows[_3a+1]){
_3c=this._rootNode.rows[_3a+1];
if(_39.onItem){
_3d=_39.scope?_39.scope:_1.global;
_39.onItem.call(_3d,_3c);
}
}
}
}});
_1.extend(_2.data.HtmlTableStore,_1.data.util.simpleFetch);
return _2.data.HtmlTableStore;
});
