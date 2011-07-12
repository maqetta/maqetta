/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/OpmlStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/data/util/filter"],function(_1,_2){
_1.declare("dojox.data.OpmlStore",null,{constructor:function(_3){
this._xmlData=null;
this._arrayOfTopLevelItems=[];
this._arrayOfAllItems=[];
this._metadataNodes=null;
this._loadFinished=false;
this.url=_3.url;
this._opmlData=_3.data;
if(_3.label){
this.label=_3.label;
}
this._loadInProgress=false;
this._queuedFetches=[];
this._identityMap={};
this._identCount=0;
this._idProp="_I";
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
},label:"text",url:"",urlPreventCache:false,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojo.data.OpmlStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5){
if(!_1.isString(_5)){
throw new Error("dojox.data.OpmlStore: a function was passed an attribute argument that was not an attribute object nor an attribute name string");
}
},_removeChildNodesThatAreNotElementNodes:function(_6,_7){
var _8=_6.childNodes;
if(_8.length===0){
return;
}
var _9=[];
var i,_a;
for(i=0;i<_8.length;++i){
_a=_8[i];
if(_a.nodeType!=1){
_9.push(_a);
}
}
for(i=0;i<_9.length;++i){
_a=_9[i];
_6.removeChild(_a);
}
if(_7){
for(i=0;i<_8.length;++i){
_a=_8[i];
this._removeChildNodesThatAreNotElementNodes(_a,_7);
}
}
},_processRawXmlTree:function(_b){
this._loadFinished=true;
this._xmlData=_b;
var _c=_b.getElementsByTagName("head");
var _d=_c[0];
if(_d){
this._removeChildNodesThatAreNotElementNodes(_d);
this._metadataNodes=_d.childNodes;
}
var _e=_b.getElementsByTagName("body");
var _f=_e[0];
if(_f){
this._removeChildNodesThatAreNotElementNodes(_f,true);
var _10=_e[0].childNodes;
for(var i=0;i<_10.length;++i){
var _11=_10[i];
if(_11.tagName=="outline"){
this._identityMap[this._identCount]=_11;
this._identCount++;
this._arrayOfTopLevelItems.push(_11);
this._arrayOfAllItems.push(_11);
this._checkChildNodes(_11);
}
}
}
},_checkChildNodes:function(_12){
if(_12.firstChild){
for(var i=0;i<_12.childNodes.length;i++){
var _13=_12.childNodes[i];
if(_13.tagName=="outline"){
this._identityMap[this._identCount]=_13;
this._identCount++;
this._arrayOfAllItems.push(_13);
this._checkChildNodes(_13);
}
}
}
},_getItemsArray:function(_14){
if(_14&&_14.deep){
return this._arrayOfAllItems;
}
return this._arrayOfTopLevelItems;
},getValue:function(_15,_16,_17){
this._assertIsItem(_15);
this._assertIsAttribute(_16);
if(_16=="children"){
return (_15.firstChild||_17);
}else{
var _18=_15.getAttribute(_16);
return (_18!==undefined)?_18:_17;
}
},getValues:function(_19,_1a){
this._assertIsItem(_19);
this._assertIsAttribute(_1a);
var _1b=[];
if(_1a=="children"){
for(var i=0;i<_19.childNodes.length;++i){
_1b.push(_19.childNodes[i]);
}
}else{
if(_19.getAttribute(_1a)!==null){
_1b.push(_19.getAttribute(_1a));
}
}
return _1b;
},getAttributes:function(_1c){
this._assertIsItem(_1c);
var _1d=[];
var _1e=_1c;
var _1f=_1e.attributes;
for(var i=0;i<_1f.length;++i){
var _20=_1f.item(i);
_1d.push(_20.nodeName);
}
if(_1e.childNodes.length>0){
_1d.push("children");
}
return _1d;
},hasAttribute:function(_21,_22){
return (this.getValues(_21,_22).length>0);
},containsValue:function(_23,_24,_25){
var _26=undefined;
if(typeof _25==="string"){
_26=_1.data.util.filter.patternToRegExp(_25,false);
}
return this._containsValue(_23,_24,_25,_26);
},_containsValue:function(_27,_28,_29,_2a){
var _2b=this.getValues(_27,_28);
for(var i=0;i<_2b.length;++i){
var _2c=_2b[i];
if(typeof _2c==="string"&&_2a){
return (_2c.match(_2a)!==null);
}else{
if(_29===_2c){
return true;
}
}
}
return false;
},isItem:function(_2d){
return (_2d&&_2d.nodeType==1&&_2d.tagName=="outline"&&_2d.ownerDocument===this._xmlData);
},isItemLoaded:function(_2e){
return this.isItem(_2e);
},loadItem:function(_2f){
},getLabel:function(_30){
if(this.isItem(_30)){
return this.getValue(_30,this.label);
}
return undefined;
},getLabelAttributes:function(_31){
return [this.label];
},_fetchItems:function(_32,_33,_34){
var _35=this;
var _36=function(_37,_38){
var _39=null;
if(_37.query){
_39=[];
var _3a=_37.queryOptions?_37.queryOptions.ignoreCase:false;
var _3b={};
for(var key in _37.query){
var _3c=_37.query[key];
if(typeof _3c==="string"){
_3b[key]=_1.data.util.filter.patternToRegExp(_3c,_3a);
}
}
for(var i=0;i<_38.length;++i){
var _3d=true;
var _3e=_38[i];
for(var key in _37.query){
var _3c=_37.query[key];
if(!_35._containsValue(_3e,key,_3c,_3b[key])){
_3d=false;
}
}
if(_3d){
_39.push(_3e);
}
}
}else{
if(_38.length>0){
_39=_38.slice(0,_38.length);
}
}
_33(_39,_37);
};
if(this._loadFinished){
_36(_32,this._getItemsArray(_32.queryOptions));
}else{
if(this._loadInProgress){
this._queuedFetches.push({args:_32,filter:_36});
}else{
if(this.url!==""){
this._loadInProgress=true;
var _3f={url:_35.url,handleAs:"xml",preventCache:_35.urlPreventCache};
var _40=_1.xhrGet(_3f);
_40.addCallback(function(_41){
_35._processRawXmlTree(_41);
_36(_32,_35._getItemsArray(_32.queryOptions));
_35._handleQueuedFetches();
});
_40.addErrback(function(_42){
throw _42;
});
}else{
if(this._opmlData){
this._processRawXmlTree(this._opmlData);
this._opmlData=null;
_36(_32,this._getItemsArray(_32.queryOptions));
}else{
throw new Error("dojox.data.OpmlStore: No OPML source data was provided as either URL or XML data input.");
}
}
}
}
},getFeatures:function(){
var _43={"dojo.data.api.Read":true,"dojo.data.api.Identity":true};
return _43;
},getIdentity:function(_44){
if(this.isItem(_44)){
for(var i in this._identityMap){
if(this._identityMap[i]===_44){
return i;
}
}
}
return null;
},fetchItemByIdentity:function(_45){
if(!this._loadFinished){
var _46=this;
if(this.url!==""){
if(this._loadInProgress){
this._queuedFetches.push({args:_45});
}else{
this._loadInProgress=true;
var _47={url:_46.url,handleAs:"xml"};
var _48=_1.xhrGet(_47);
_48.addCallback(function(_49){
var _4a=_45.scope?_45.scope:_1.global;
try{
_46._processRawXmlTree(_49);
var _4b=_46._identityMap[_45.identity];
if(!_46.isItem(_4b)){
_4b=null;
}
if(_45.onItem){
_45.onItem.call(_4a,_4b);
}
_46._handleQueuedFetches();
}
catch(error){
if(_45.onError){
_45.onError.call(_4a,error);
}
}
});
_48.addErrback(function(_4c){
this._loadInProgress=false;
if(_45.onError){
var _4d=_45.scope?_45.scope:_1.global;
_45.onError.call(_4d,_4c);
}
});
}
}else{
if(this._opmlData){
this._processRawXmlTree(this._opmlData);
this._opmlData=null;
var _4e=this._identityMap[_45.identity];
if(!_46.isItem(_4e)){
_4e=null;
}
if(_45.onItem){
var _4f=_45.scope?_45.scope:_1.global;
_45.onItem.call(_4f,_4e);
}
}
}
}else{
var _4e=this._identityMap[_45.identity];
if(!this.isItem(_4e)){
_4e=null;
}
if(_45.onItem){
var _4f=_45.scope?_45.scope:_1.global;
_45.onItem.call(_4f,_4e);
}
}
},getIdentityAttributes:function(_50){
return null;
},_handleQueuedFetches:function(){
if(this._queuedFetches.length>0){
for(var i=0;i<this._queuedFetches.length;i++){
var _51=this._queuedFetches[i];
var _52=_51.args;
var _53=_51.filter;
if(_53){
_53(_52,this._getItemsArray(_52.queryOptions));
}else{
this.fetchItemByIdentity(_52);
}
}
this._queuedFetches=[];
}
},close:function(_54){
}});
_1.extend(_2.data.OpmlStore,_1.data.util.simpleFetch);
return _2.data.OpmlStore;
});
