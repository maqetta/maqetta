/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/HtmlStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/data/util/filter","dojox/xml/parser"],function(_1,_2){
_1.declare("dojox.data.HtmlStore",null,{constructor:function(_3){
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
if(_3&&"trimWhitespace" in _3){
this.trimWhitespace=_3.trimWhitespace?true:false;
}
if(_3.url){
if(!_3.dataId){
throw new Error("dojo.data.HtmlStore: Cannot instantiate using url without an id!");
}
this.url=_3.url;
this.dataId=_3.dataId;
}else{
if(_3.dataId){
this.dataId=_3.dataId;
}
}
if(_3&&"fetchOnCreate" in _3){
this.fetchOnCreate=_3.fetchOnCreate?true:false;
}
if(this.fetchOnCreate&&this.dataId){
this.fetch();
}
},url:"",dataId:"",trimWhitespace:false,urlPreventCache:false,fetchOnCreate:false,_indexItems:function(){
this._getHeadings();
if(this._rootNode.rows){
if(this._rootNode.tBodies&&this._rootNode.tBodies.length>0){
this._rootNode=this._rootNode.tBodies[0];
}
var i;
for(i=0;i<this._rootNode.rows.length;i++){
this._rootNode.rows[i]._ident=i+1;
}
}else{
var c=1;
for(i=0;i<this._rootNode.childNodes.length;i++){
if(this._rootNode.childNodes[i].nodeType===1){
this._rootNode.childNodes[i]._ident=c;
c++;
}
}
}
},_getHeadings:function(){
this._headings=[];
if(this._rootNode.tHead){
_1.forEach(this._rootNode.tHead.rows[0].cells,_1.hitch(this,function(th){
var _4=_2.xml.parser.textContent(th);
this._headings.push(this.trimWhitespace?_1.trim(_4):_4);
}));
}else{
this._headings=["name"];
}
},_getAllItems:function(){
var _5=[];
var i;
if(this._rootNode.rows){
for(i=0;i<this._rootNode.rows.length;i++){
_5.push(this._rootNode.rows[i]);
}
}else{
for(i=0;i<this._rootNode.childNodes.length;i++){
if(this._rootNode.childNodes[i].nodeType===1){
_5.push(this._rootNode.childNodes[i]);
}
}
}
return _5;
},_assertIsItem:function(_6){
if(!this.isItem(_6)){
throw new Error("dojo.data.HtmlStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_7){
if(typeof _7!=="string"){
throw new Error("dojo.data.HtmlStore: a function was passed an attribute argument that was not an attribute name string");
return -1;
}
return _1.indexOf(this._headings,_7);
},getValue:function(_8,_9,_a){
var _b=this.getValues(_8,_9);
return (_b.length>0)?_b[0]:_a;
},getValues:function(_c,_d){
this._assertIsItem(_c);
var _e=this._assertIsAttribute(_d);
if(_e>-1){
var _f;
if(_c.cells){
_f=_2.xml.parser.textContent(_c.cells[_e]);
}else{
_f=_2.xml.parser.textContent(_c);
}
return [this.trimWhitespace?_1.trim(_f):_f];
}
return [];
},getAttributes:function(_10){
this._assertIsItem(_10);
var _11=[];
for(var i=0;i<this._headings.length;i++){
if(this.hasAttribute(_10,this._headings[i])){
_11.push(this._headings[i]);
}
}
return _11;
},hasAttribute:function(_12,_13){
return this.getValues(_12,_13).length>0;
},containsValue:function(_14,_15,_16){
var _17=undefined;
if(typeof _16==="string"){
_17=_1.data.util.filter.patternToRegExp(_16,false);
}
return this._containsValue(_14,_15,_16,_17);
},_containsValue:function(_18,_19,_1a,_1b){
var _1c=this.getValues(_18,_19);
for(var i=0;i<_1c.length;++i){
var _1d=_1c[i];
if(typeof _1d==="string"&&_1b){
return (_1d.match(_1b)!==null);
}else{
if(_1a===_1d){
return true;
}
}
}
return false;
},isItem:function(_1e){
return _1e&&_1.isDescendant(_1e,this._rootNode);
},isItemLoaded:function(_1f){
return this.isItem(_1f);
},loadItem:function(_20){
this._assertIsItem(_20.item);
},_fetchItems:function(_21,_22,_23){
if(this._rootNode){
this._finishFetchItems(_21,_22,_23);
}else{
if(!this.url){
this._rootNode=_1.byId(this.dataId);
this._indexItems();
this._finishFetchItems(_21,_22,_23);
}else{
var _24={url:this.url,handleAs:"text",preventCache:this.urlPreventCache};
var _25=this;
var _26=_1.xhrGet(_24);
_26.addCallback(function(_27){
var _28=function(_29,id){
if(_29.id==id){
return _29;
}
if(_29.childNodes){
for(var i=0;i<_29.childNodes.length;i++){
var _2a=_28(_29.childNodes[i],id);
if(_2a){
return _2a;
}
}
}
return null;
};
var d=document.createElement("div");
d.innerHTML=_27;
_25._rootNode=_28(d,_25.dataId);
_25._indexItems();
_25._finishFetchItems(_21,_22,_23);
});
_26.addErrback(function(_2b){
_23(_2b,_21);
});
}
}
},_finishFetchItems:function(_2c,_2d,_2e){
var _2f=[];
var _30=this._getAllItems();
if(_2c.query){
var _31=_2c.queryOptions?_2c.queryOptions.ignoreCase:false;
_2f=[];
var _32={};
var key;
var _33;
for(key in _2c.query){
_33=_2c.query[key]+"";
if(typeof _33==="string"){
_32[key]=_1.data.util.filter.patternToRegExp(_33,_31);
}
}
for(var i=0;i<_30.length;++i){
var _34=true;
var _35=_30[i];
for(key in _2c.query){
_33=_2c.query[key]+"";
if(!this._containsValue(_35,key,_33,_32[key])){
_34=false;
}
}
if(_34){
_2f.push(_35);
}
}
_2d(_2f,_2c);
}else{
if(_30.length>0){
_2f=_30.slice(0,_30.length);
}
_2d(_2f,_2c);
}
},getFeatures:function(){
return {"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
},close:function(_36){
},getLabel:function(_37){
if(this.isItem(_37)){
if(_37.cells){
return "Item #"+this.getIdentity(_37);
}else{
return this.getValue(_37,"name");
}
}
return undefined;
},getLabelAttributes:function(_38){
if(_38.cells){
return null;
}else{
return ["name"];
}
},getIdentity:function(_39){
this._assertIsItem(_39);
if(this.hasAttribute(_39,"name")){
return this.getValue(_39,"name");
}else{
return _39._ident;
}
},getIdentityAttributes:function(_3a){
return null;
},fetchItemByIdentity:function(_3b){
var _3c=_3b.identity;
var _3d=this;
var _3e=null;
var _3f=null;
if(!this._rootNode){
if(!this.url){
this._rootNode=_1.byId(this.dataId);
this._indexItems();
if(_3d._rootNode.rows){
_3e=this._rootNode.rows[_3c+1];
}else{
for(var i=0;i<_3d._rootNode.childNodes.length;i++){
if(_3d._rootNode.childNodes[i].nodeType===1&&_3c===_2.xml.parser.textContent(_3d._rootNode.childNodes[i])){
_3e=_3d._rootNode.childNodes[i];
}
}
}
if(_3b.onItem){
_3f=_3b.scope?_3b.scope:_1.global;
_3b.onItem.call(_3f,_3e);
}
}else{
var _40={url:this.url,handleAs:"text"};
var _41=_1.xhrGet(_40);
_41.addCallback(function(_42){
var _43=function(_44,id){
if(_44.id==id){
return _44;
}
if(_44.childNodes){
for(var i=0;i<_44.childNodes.length;i++){
var _45=_43(_44.childNodes[i],id);
if(_45){
return _45;
}
}
}
return null;
};
var d=document.createElement("div");
d.innerHTML=_42;
_3d._rootNode=_43(d,_3d.dataId);
_3d._indexItems();
if(_3d._rootNode.rows&&_3c<=_3d._rootNode.rows.length){
_3e=_3d._rootNode.rows[_3c-1];
}else{
for(var i=0;i<_3d._rootNode.childNodes.length;i++){
if(_3d._rootNode.childNodes[i].nodeType===1&&_3c===_2.xml.parser.textContent(_3d._rootNode.childNodes[i])){
_3e=_3d._rootNode.childNodes[i];
break;
}
}
}
if(_3b.onItem){
_3f=_3b.scope?_3b.scope:_1.global;
_3b.onItem.call(_3f,_3e);
}
});
_41.addErrback(function(_46){
if(_3b.onError){
_3f=_3b.scope?_3b.scope:_1.global;
_3b.onError.call(_3f,_46);
}
});
}
}else{
if(this._rootNode.rows[_3c+1]){
_3e=this._rootNode.rows[_3c+1];
if(_3b.onItem){
_3f=_3b.scope?_3b.scope:_1.global;
_3b.onItem.call(_3f,_3e);
}
}
}
}});
_1.extend(_2.data.HtmlStore,_1.data.util.simpleFetch);
return _2.data.HtmlStore;
});
