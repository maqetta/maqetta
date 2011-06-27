/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/GoogleSearchStore",["dojo","dojox","dojo/io/script"],function(_1,_2){
_1.experimental("dojox.data.GoogleSearchStore");
_1.declare("dojox.data.GoogleSearchStore",null,{constructor:function(_3){
if(_3){
if(_3.label){
this.label=_3.label;
}
if(_3.key){
this._key=_3.key;
}
if(_3.lang){
this._lang=_3.lang;
}
if("urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
}
this._id=_2.data.GoogleSearchStore.prototype._id++;
},_id:0,_requestCount:0,_googleUrl:"http://ajax.googleapis.com/ajax/services/search/",_storeRef:"_S",_attributes:["unescapedUrl","url","visibleUrl","cacheUrl","title","titleNoFormatting","content","estimatedResultCount"],_aggregatedAttributes:{estimatedResultCount:"cursor.estimatedResultCount"},label:"titleNoFormatting",_type:"web",urlPreventCache:true,_queryAttrs:{text:"q"},_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojox.data.GoogleSearchStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5){
if(typeof _5!=="string"){
throw new Error("dojox.data.GoogleSearchStore: a function was passed an attribute argument that was not an attribute name string");
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
return this._attributes;
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
var val=_15[_16];
if(_1.isArray(val)){
return val;
}else{
if(val!==undefined){
return [val];
}else{
return [];
}
}
},isItem:function(_17){
if(_17&&_17[this._storeRef]===this){
return true;
}
return false;
},close:function(_18){
},_format:function(_19,_1a){
return _19;
},fetch:function(_1b){
_1b=_1b||{};
var _1c=_1b.scope||_1.global;
if(!_1b.query){
if(_1b.onError){
_1b.onError.call(_1c,new Error(this.declaredClass+": A query must be specified."));
return;
}
}
var _1d={};
for(var _1e in this._queryAttrs){
_1d[_1e]=_1b.query[_1e];
}
_1b={query:_1d,onComplete:_1b.onComplete,onError:_1b.onError,onItem:_1b.onItem,onBegin:_1b.onBegin,start:_1b.start,count:_1b.count};
var _1f=8;
var _20="GoogleSearchStoreCallback_"+this._id+"_"+(++this._requestCount);
var _21=this._createContent(_1d,_20,_1b);
var _22;
if(typeof (_1b.start)==="undefined"||_1b.start===null){
_1b.start=0;
}
if(!_1b.count){
_1b.count=_1f;
}
_22={start:_1b.start-_1b.start%_1f};
var _23=this;
var _24=this._googleUrl+this._type;
var _25={url:_24,preventCache:this.urlPreventCache,content:_21};
var _26=[];
var _27=0;
var _28=false;
var _29=_1b.start-1;
var _2a=0;
var _2b=[];
function _2c(req){
_2a++;
_25.content.context=_25.content.start=req.start;
var _2d=_1.io.script.get(_25);
_2b.push(_2d.ioArgs.id);
_2d.addErrback(function(_2e){
if(_1b.onError){
_1b.onError.call(_1c,_2e,_1b);
}
});
};
var _2f=function(_30,_31){
if(_2b.length>0){
_1.query("#"+_2b.splice(0,1)).forEach(_1.destroy);
}
if(_28){
return;
}
var _32=_23._getItems(_31);
var _33=_31?_31["cursor"]:null;
if(_32){
for(var i=0;i<_32.length&&i+_30<_1b.count+_1b.start;i++){
_23._processItem(_32[i],_31);
_26[i+_30]=_32[i];
}
_27++;
if(_27==1){
var _34=_33?_33.pages:null;
var _35=_34?Number(_34[_34.length-1].start):0;
if(_1b.onBegin){
var est=_33?_33.estimatedResultCount:_32.length;
var _36=est?Math.min(est,_35+_32.length):_35+_32.length;
_1b.onBegin.call(_1c,_36,_1b);
}
var _37=(_1b.start-_1b.start%_1f)+_1f;
var _38=1;
while(_34){
if(!_34[_38]||Number(_34[_38].start)>=_1b.start+_1b.count){
break;
}
if(Number(_34[_38].start)>=_37){
_2c({start:_34[_38].start});
}
_38++;
}
}
if(_1b.onItem&&_26[_29+1]){
do{
_29++;
_1b.onItem.call(_1c,_26[_29],_1b);
}while(_26[_29+1]&&_29<_1b.start+_1b.count);
}
if(_27==_2a){
_28=true;
_1.global[_20]=null;
if(_1b.onItem){
_1b.onComplete.call(_1c,null,_1b);
}else{
_26=_26.slice(_1b.start,_1b.start+_1b.count);
_1b.onComplete.call(_1c,_26,_1b);
}
}
}
};
var _39=[];
var _3a=_22.start-1;
_1.global[_20]=function(_3b,_3c,_3d,_3e){
try{
if(_3d!=200){
if(_1b.onError){
_1b.onError.call(_1c,new Error("Response from Google was: "+_3d),_1b);
}
_1.global[_20]=function(){
};
return;
}
if(_3b==_3a+1){
_2f(Number(_3b),_3c);
_3a+=_1f;
if(_39.length>0){
_39.sort(_23._getSort());
while(_39.length>0&&_39[0].start==_3a+1){
_2f(Number(_39[0].start),_39[0].data);
_39.splice(0,1);
_3a+=_1f;
}
}
}else{
_39.push({start:_3b,data:_3c});
}
}
catch(e){
_1b.onError.call(_1c,e,_1b);
}
};
_2c(_22);
},_getSort:function(){
return function(a,b){
if(a.start<b.start){
return -1;
}
if(b.start<a.start){
return 1;
}
return 0;
};
},_processItem:function(_3f,_40){
_3f[this._storeRef]=this;
for(var _41 in this._aggregatedAttributes){
_3f[_41]=_1.getObject(this._aggregatedAttributes[_41],false,_40);
}
},_getItems:function(_42){
return _42["results"]||_42;
},_createContent:function(_43,_44,_45){
var _46={v:"1.0",rsz:"large",callback:_44,key:this._key,hl:this._lang};
for(var _47 in this._queryAttrs){
_46[this._queryAttrs[_47]]=_43[_47];
}
return _46;
}});
_1.declare("dojox.data.GoogleWebSearchStore",_2.data.GoogleSearchStore,{});
_1.declare("dojox.data.GoogleBlogSearchStore",_2.data.GoogleSearchStore,{_type:"blogs",_attributes:["blogUrl","postUrl","title","titleNoFormatting","content","author","publishedDate"],_aggregatedAttributes:{}});
_1.declare("dojox.data.GoogleLocalSearchStore",_2.data.GoogleSearchStore,{_type:"local",_attributes:["title","titleNoFormatting","url","lat","lng","streetAddress","city","region","country","phoneNumbers","ddUrl","ddUrlToHere","ddUrlFromHere","staticMapUrl","viewport"],_aggregatedAttributes:{viewport:"viewport"},_queryAttrs:{text:"q",centerLatLong:"sll",searchSpan:"sspn"}});
_1.declare("dojox.data.GoogleVideoSearchStore",_2.data.GoogleSearchStore,{_type:"video",_attributes:["title","titleNoFormatting","content","url","published","publisher","duration","tbWidth","tbHeight","tbUrl","playUrl"],_aggregatedAttributes:{}});
_1.declare("dojox.data.GoogleNewsSearchStore",_2.data.GoogleSearchStore,{_type:"news",_attributes:["title","titleNoFormatting","content","url","unescapedUrl","publisher","clusterUrl","location","publishedDate","relatedStories"],_aggregatedAttributes:{}});
_1.declare("dojox.data.GoogleBookSearchStore",_2.data.GoogleSearchStore,{_type:"books",_attributes:["title","titleNoFormatting","authors","url","unescapedUrl","bookId","pageCount","publishedYear"],_aggregatedAttributes:{}});
_1.declare("dojox.data.GoogleImageSearchStore",_2.data.GoogleSearchStore,{_type:"images",_attributes:["title","titleNoFormatting","visibleUrl","url","unescapedUrl","originalContextUrl","width","height","tbWidth","tbHeight","tbUrl","content","contentNoFormatting"],_aggregatedAttributes:{}});
return _2.data.GoogleSearchStore;
});
