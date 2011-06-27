/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/PicasaStore",["dojo","dojox","dojo/io/script","dojo/data/util/simpleFetch","dojo/date/stamp"],function(_1,_2){
_1.declare("dojox.data.PicasaStore",null,{constructor:function(_3){
if(_3&&_3.label){
this.label=_3.label;
}
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
if(_3&&"maxResults" in _3){
this.maxResults=parseInt(_3.maxResults);
if(!this.maxResults){
this.maxResults=20;
}
}
},_picasaUrl:"http://picasaweb.google.com/data/feed/api/all",_storeRef:"_S",label:"title",urlPreventCache:false,maxResults:20,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojox.data.PicasaStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5){
if(typeof _5!=="string"){
throw new Error("dojox.data.PicasaStore: a function was passed an attribute argument that was not an attribute name string");
}
},getFeatures:function(){
return {"dojo.data.api.Read":true};
},getValue:function(_6,_7,_8){
var _9=this.getValues(_6,_7);
if(_9&&_9.length>0){
return _9[0];
}
return _8;
},getAttributes:function(_a){
return ["id","published","updated","category","title$type","title","summary$type","summary","rights$type","rights","link","author","gphoto$id","gphoto$name","location","imageUrlSmall","imageUrlMedium","imageUrl","datePublished","dateTaken","description"];
},hasAttribute:function(_b,_c){
if(this.getValue(_b,_c)){
return true;
}
return false;
},isItemLoaded:function(_d){
return this.isItem(_d);
},loadItem:function(_e){
},getLabel:function(_f){
return this.getValue(_f,this.label);
},getLabelAttributes:function(_10){
return [this.label];
},containsValue:function(_11,_12,_13){
var _14=this.getValues(_11,_12);
for(var i=0;i<_14.length;i++){
if(_14[i]===_13){
return true;
}
}
return false;
},getValues:function(_15,_16){
this._assertIsItem(_15);
this._assertIsAttribute(_16);
if(_16==="title"){
return [this._unescapeHtml(_15.title)];
}else{
if(_16==="author"){
return [this._unescapeHtml(_15.author[0].name)];
}else{
if(_16==="datePublished"){
return [_1.date.stamp.fromISOString(_15.published)];
}else{
if(_16==="dateTaken"){
return [_1.date.stamp.fromISOString(_15.published)];
}else{
if(_16==="updated"){
return [_1.date.stamp.fromISOString(_15.updated)];
}else{
if(_16==="imageUrlSmall"){
return [_15.media.thumbnail[1].url];
}else{
if(_16==="imageUrl"){
return [_15.content$src];
}else{
if(_16==="imageUrlMedium"){
return [_15.media.thumbnail[2].url];
}else{
if(_16==="link"){
return [_15.link[1]];
}else{
if(_16==="tags"){
return _15.tags.split(" ");
}else{
if(_16==="description"){
return [this._unescapeHtml(_15.summary)];
}
}
}
}
}
}
}
}
}
}
}
return [];
},isItem:function(_17){
if(_17&&_17[this._storeRef]===this){
return true;
}
return false;
},close:function(_18){
},_fetchItems:function(_19,_1a,_1b){
if(!_19.query){
_19.query={};
}
var _1c={alt:"jsonm",pp:"1",psc:"G"};
_1c["start-index"]="1";
if(_19.query.start){
_1c["start-index"]=_19.query.start;
}
if(_19.query.tags){
_1c.q=_19.query.tags;
}
if(_19.query.userid){
_1c.uname=_19.query.userid;
}
if(_19.query.userids){
_1c.ids=_19.query.userids;
}
if(_19.query.lang){
_1c.hl=_19.query.lang;
}
_1c["max-results"]=this.maxResults;
var _1d=this;
var _1e=null;
var _1f=function(_20){
if(_1e!==null){
_1.disconnect(_1e);
}
_1a(_1d._processPicasaData(_20),_19);
};
var _21={url:this._picasaUrl,preventCache:this.urlPreventCache,content:_1c,callbackParamName:"callback",handle:_1f};
var _22=_1.io.script.get(_21);
_22.addErrback(function(_23){
_1.disconnect(_1e);
_1b(_23,_19);
});
},_processPicasaData:function(_24){
var _25=[];
if(_24.feed){
_25=_24.feed.entry;
for(var i=0;i<_25.length;i++){
var _26=_25[i];
_26[this._storeRef]=this;
}
}
return _25;
},_unescapeHtml:function(str){
if(str){
str=str.replace(/&amp;/gm,"&").replace(/&lt;/gm,"<").replace(/&gt;/gm,">").replace(/&quot;/gm,"\"");
str=str.replace(/&#39;/gm,"'");
}
return str;
}});
_1.extend(_2.data.PicasaStore,_1.data.util.simpleFetch);
return _2.data.PicasaStore;
});
