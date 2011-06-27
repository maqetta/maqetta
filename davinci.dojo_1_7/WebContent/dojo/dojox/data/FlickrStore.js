/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/FlickrStore",["dojo","dojox","dojo/data/util/simpleFetch","dojo/io/script","dojo/date/stamp","dojo/AdapterRegistry"],function(_1,_2){
_1.declare("dojox.data.FlickrStore",null,{constructor:function(_3){
if(_3&&_3.label){
this.label=_3.label;
}
if(_3&&"urlPreventCache" in _3){
this.urlPreventCache=_3.urlPreventCache?true:false;
}
},_storeRef:"_S",label:"title",urlPreventCache:true,_assertIsItem:function(_4){
if(!this.isItem(_4)){
throw new Error("dojox.data.FlickrStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_5){
if(typeof _5!=="string"){
throw new Error("dojox.data.FlickrStore: a function was passed an attribute argument that was not an attribute name string");
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
return ["title","description","author","datePublished","dateTaken","imageUrl","imageUrlSmall","imageUrlMedium","tags","link"];
},hasAttribute:function(_b,_c){
var v=this.getValue(_b,_c);
if(v||v===""||v===false){
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
var u=_1.hitch(this,"_unescapeHtml");
var s=_1.hitch(_1.date.stamp,"fromISOString");
switch(_16){
case "title":
return [u(_15.title)];
case "author":
return [u(_15.author)];
case "datePublished":
return [s(_15.published)];
case "dateTaken":
return [s(_15.date_taken)];
case "imageUrlSmall":
return [_15.media.m.replace(/_m\./,"_s.")];
case "imageUrl":
return [_15.media.m.replace(/_m\./,".")];
case "imageUrlMedium":
return [_15.media.m];
case "link":
return [_15.link];
case "tags":
return _15.tags.split(" ");
case "description":
return [u(_15.description)];
default:
return [];
}
},isItem:function(_17){
if(_17&&_17[this._storeRef]===this){
return true;
}
return false;
},close:function(_18){
},_fetchItems:function(_19,_1a,_1b){
var rq=_19.query=_19.query||{};
var _1c={format:"json",tagmode:"any"};
_1.forEach(["tags","tagmode","lang","id","ids"],function(i){
if(rq[i]){
_1c[i]=rq[i];
}
});
_1c.id=rq.id||rq.userid||rq.groupid;
if(rq.userids){
_1c.ids=rq.userids;
}
var _1d=null;
var _1e={url:_2.data.FlickrStore.urlRegistry.match(_19),preventCache:this.urlPreventCache,content:_1c};
var _1f=_1.hitch(this,function(_20){
if(!!_1d){
_1.disconnect(_1d);
}
_1a(this._processFlickrData(_20),_19);
});
_1d=_1.connect("jsonFlickrFeed",_1f);
var _21=_1.io.script.get(_1e);
_21.addErrback(function(_22){
_1.disconnect(_1d);
_1b(_22,_19);
});
},_processFlickrData:function(_23){
var _24=[];
if(_23.items){
_24=_23.items;
for(var i=0;i<_23.items.length;i++){
var _25=_23.items[i];
_25[this._storeRef]=this;
}
}
return _24;
},_unescapeHtml:function(str){
return str.replace(/&amp;/gm,"&").replace(/&lt;/gm,"<").replace(/&gt;/gm,">").replace(/&quot;/gm,"\"").replace(/&#39;/gm,"'");
}});
_1.extend(_2.data.FlickrStore,_1.data.util.simpleFetch);
var _26="http://api.flickr.com/services/feeds/";
var reg=_2.data.FlickrStore.urlRegistry=new _1.AdapterRegistry(true);
reg.register("group pool",function(_27){
return !!_27.query["groupid"];
},_26+"groups_pool.gne");
reg.register("default",function(_28){
return true;
},_26+"photos_public.gne");
if(!_29){
var _29=function(_2a){
};
}
return _2.data.FlickrStore;
});
