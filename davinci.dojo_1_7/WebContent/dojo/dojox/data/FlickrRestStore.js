/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/FlickrRestStore",["dojo","dojox","dojox/data/FlickrStore"],function(_1,_2){
_1.declare("dojox.data.FlickrRestStore",_2.data.FlickrStore,{constructor:function(_3){
if(_3){
if(_3.label){
this.label=_3.label;
}
if(_3.apikey){
this._apikey=_3.apikey;
}
}
this._cache=[];
this._prevRequests={};
this._handlers={};
this._prevRequestRanges=[];
this._maxPhotosPerUser={};
this._id=_2.data.FlickrRestStore.prototype._id++;
},_id:0,_requestCount:0,_flickrRestUrl:"http://www.flickr.com/services/rest/",_apikey:null,_storeRef:"_S",_cache:null,_prevRequests:null,_handlers:null,_sortAttributes:{"date-posted":true,"date-taken":true,"interestingness":true},_fetchItems:function(_4,_5,_6){
var _7={};
if(!_4.query){
_4.query=_7={};
}else{
_1.mixin(_7,_4.query);
}
var _8=[];
var _9=[];
var _a={format:"json",method:"flickr.photos.search",api_key:this._apikey,extras:"owner_name,date_upload,date_taken"};
var _b=false;
if(_7.userid){
_b=true;
_a.user_id=_4.query.userid;
_8.push("userid"+_4.query.userid);
}
if(_7.groupid){
_b=true;
_a.group_id=_7.groupid;
_8.push("groupid"+_7.groupid);
}
if(_7.apikey){
_b=true;
_a.api_key=_4.query.apikey;
_9.push("api"+_4.query.apikey);
}else{
if(_a.api_key){
_b=true;
_4.query.apikey=_a.api_key;
_9.push("api"+_a.api_key);
}else{
throw Error("dojox.data.FlickrRestStore: An API key must be specified.");
}
}
_4._curCount=_4.count;
if(_7.page){
_a.page=_4.query.page;
_9.push("page"+_a.page);
}else{
if(("start" in _4)&&_4.start!==null){
if(!_4.count){
_4.count=20;
}
var _c=_4.start%_4.count;
var _d=_4.start,_e=_4.count;
if(_c!==0){
if(_d<_e/2){
_e=_d+_e;
_d=0;
}else{
var _f=20,div=2;
for(var i=_f;i>0;i--){
if(_d%i===0&&(_d/i)>=_e){
div=i;
break;
}
}
_e=_d/div;
}
_4._realStart=_4.start;
_4._realCount=_4.count;
_4._curStart=_d;
_4._curCount=_e;
}else{
_4._realStart=_4._realCount=null;
_4._curStart=_4.start;
_4._curCount=_4.count;
}
_a.page=(_d/_e)+1;
_9.push("page"+_a.page);
}
}
if(_4._curCount){
_a.per_page=_4._curCount;
_9.push("count"+_4._curCount);
}
if(_7.lang){
_a.lang=_4.query.lang;
_8.push("lang"+_4.lang);
}
if(_7.setid){
_a.method="flickr.photosets.getPhotos";
_a.photoset_id=_4.query.setid;
_8.push("set"+_4.query.setid);
}
if(_7.tags){
if(_7.tags instanceof Array){
_a.tags=_7.tags.join(",");
}else{
_a.tags=_7.tags;
}
_8.push("tags"+_a.tags);
if(_7["tag_mode"]&&(_7.tag_mode.toLowerCase()==="any"||_7.tag_mode.toLowerCase()==="all")){
_a.tag_mode=_7.tag_mode;
}
}
if(_7.text){
_a.text=_7.text;
_8.push("text:"+_7.text);
}
if(_7.sort&&_7.sort.length>0){
if(!_7.sort[0].attribute){
_7.sort[0].attribute="date-posted";
}
if(this._sortAttributes[_7.sort[0].attribute]){
if(_7.sort[0].descending){
_a.sort=_7.sort[0].attribute+"-desc";
}else{
_a.sort=_7.sort[0].attribute+"-asc";
}
}
}else{
_a.sort="date-posted-asc";
}
_8.push("sort:"+_a.sort);
_8=_8.join(".");
_9=_9.length>0?"."+_9.join("."):"";
var _10=_8+_9;
_4={query:_7,count:_4._curCount,start:_4._curStart,_realCount:_4._realCount,_realStart:_4._realStart,onBegin:_4.onBegin,onComplete:_4.onComplete,onItem:_4.onItem};
var _11={request:_4,fetchHandler:_5,errorHandler:_6};
if(this._handlers[_10]){
this._handlers[_10].push(_11);
return;
}
this._handlers[_10]=[_11];
var _12=null;
var _13={url:this._flickrRestUrl,preventCache:this.urlPreventCache,content:_a,callbackParamName:"jsoncallback"};
var _14=_1.hitch(this,function(_15,_16,_17){
var _18=_17.request.onBegin;
_17.request.onBegin=null;
var _19;
var req=_17.request;
if(("_realStart" in req)&&req._realStart!=null){
req.start=req._realStart;
req.count=req._realCount;
req._realStart=req._realCount=null;
}
if(_18){
var _1a=null;
if(_16){
_1a=(_16.photoset?_16.photoset:_16.photos);
}
if(_1a&&("perpage" in _1a)&&("pages" in _1a)){
if(_1a.perpage*_1a.pages<=_17.request.start+_17.request.count){
_19=_17.request.start+_1a.photo.length;
}else{
_19=_1a.perpage*_1a.pages;
}
this._maxPhotosPerUser[_8]=_19;
_18(_19,_17.request);
}else{
if(this._maxPhotosPerUser[_8]){
_18(this._maxPhotosPerUser[_8],_17.request);
}
}
}
_17.fetchHandler(_15,_17.request);
if(_18){
_17.request.onBegin=_18;
}
});
var _1b=_1.hitch(this,function(_1c){
if(_1c.stat!="ok"){
_6(null,_4);
}else{
var _1d=this._handlers[_10];
if(!_1d){
return;
}
this._handlers[_10]=null;
this._prevRequests[_10]=_1c;
var _1e=this._processFlickrData(_1c,_4,_8);
if(!this._prevRequestRanges[_8]){
this._prevRequestRanges[_8]=[];
}
this._prevRequestRanges[_8].push({start:_4.start,end:_4.start+(_1c.photoset?_1c.photoset.photo.length:_1c.photos.photo.length)});
_1.forEach(_1d,function(i){
_14(_1e,_1c,i);
});
}
});
var _1f=this._prevRequests[_10];
if(_1f){
this._handlers[_10]=null;
_14(this._cache[_8],_1f,_11);
return;
}else{
if(this._checkPrevRanges(_8,_4.start,_4.count)){
this._handlers[_10]=null;
_14(this._cache[_8],null,_11);
return;
}
}
var _20=_1.io.script.get(_13);
_20.addCallback(_1b);
_20.addErrback(function(_21){
_1.disconnect(_12);
_6(_21,_4);
});
},getAttributes:function(_22){
return ["title","author","imageUrl","imageUrlSmall","imageUrlMedium","imageUrlThumb","imageUrlLarge","imageUrlOriginal","link","dateTaken","datePublished"];
},getValues:function(_23,_24){
this._assertIsItem(_23);
this._assertIsAttribute(_24);
switch(_24){
case "title":
return [this._unescapeHtml(_23.title)];
case "author":
return [_23.ownername];
case "imageUrlSmall":
return [_23.media.s];
case "imageUrl":
return [_23.media.l];
case "imageUrlOriginal":
return [_23.media.o];
case "imageUrlLarge":
return [_23.media.l];
case "imageUrlMedium":
return [_23.media.m];
case "imageUrlThumb":
return [_23.media.t];
case "link":
return ["http://www.flickr.com/photos/"+_23.owner+"/"+_23.id];
case "dateTaken":
return [_23.datetaken];
case "datePublished":
return [_23.datepublished];
default:
return undefined;
}
},_processFlickrData:function(_25,_26,_27){
if(_25.items){
return _2.data.FlickrStore.prototype._processFlickrData.apply(this,arguments);
}
var _28=["http://farm",null,".static.flickr.com/",null,"/",null,"_",null];
var _29=[];
var _2a=(_25.photoset?_25.photoset:_25.photos);
if(_25.stat=="ok"&&_2a&&_2a.photo){
_29=_2a.photo;
for(var i=0;i<_29.length;i++){
var _2b=_29[i];
_2b[this._storeRef]=this;
_28[1]=_2b.farm;
_28[3]=_2b.server;
_28[5]=_2b.id;
_28[7]=_2b.secret;
var _2c=_28.join("");
_2b.media={s:_2c+"_s.jpg",m:_2c+"_m.jpg",l:_2c+".jpg",t:_2c+"_t.jpg",o:_2c+"_o.jpg"};
if(!_2b.owner&&_25.photoset){
_2b.owner=_25.photoset.owner;
}
}
}
var _2d=_26.start?_26.start:0;
var arr=this._cache[_27];
if(!arr){
this._cache[_27]=arr=[];
}
_1.forEach(_29,function(i,idx){
arr[idx+_2d]=i;
});
return arr;
},_checkPrevRanges:function(_2e,_2f,_30){
var end=_2f+_30;
var arr=this._prevRequestRanges[_2e];
return (!!arr)&&_1.some(arr,function(_31){
return ((_2f>=_31.start)&&(end<=_31.end));
});
}});
return _2.data.FlickrRestStore;
});
