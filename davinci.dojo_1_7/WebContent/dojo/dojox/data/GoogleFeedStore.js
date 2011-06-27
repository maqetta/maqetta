/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/GoogleFeedStore",["dojo","dojox","dojox/data/GoogleSearchStore"],function(_1,_2){
_1.experimental("dojox.data.GoogleFeedStore");
_1.declare("dojox.data.GoogleFeedStore",_2.data.GoogleSearchStore,{_type:"",_googleUrl:"http://ajax.googleapis.com/ajax/services/feed/load",_attributes:["title","link","author","published","content","summary","categories"],_queryAttrs:{"url":"q"},getFeedValue:function(_3,_4){
var _5=this.getFeedValues(_3,_4);
if(_1.isArray(_5)){
return _5[0];
}
return _5;
},getFeedValues:function(_6,_7){
if(!this._feedMetaData){
return _7;
}
return this._feedMetaData[_6]||_7;
},_processItem:function(_8,_9){
this.inherited(arguments);
_8["summary"]=_8["contentSnippet"];
_8["published"]=_8["publishedDate"];
},_getItems:function(_a){
if(_a["feed"]){
this._feedMetaData={title:_a.feed.title,desc:_a.feed.description,url:_a.feed.link,author:_a.feed.author};
return _a.feed.entries;
}
return null;
},_createContent:function(_b,_c,_d){
var cb=this.inherited(arguments);
cb.num=(_d.count||10)+(_d.start||0);
return cb;
}});
return _2.data.GoogleFeedStore;
});
