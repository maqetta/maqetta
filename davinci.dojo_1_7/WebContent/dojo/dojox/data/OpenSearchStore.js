/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/OpenSearchStore",["dojo","dijit","dojox","dojo/data/util/simpleFetch","dojox/xml/DomParser","dojox/xml/parser"],function(_1,_2,_3){
_1.getObject("dojox.data.OpenSearchStore",1);
_1.experimental("dojox.data.OpenSearchStore");
_1.declare("dojox.data.OpenSearchStore",null,{constructor:function(_4){
if(_4){
this.label=_4.label;
this.url=_4.url;
this.itemPath=_4.itemPath;
if("urlPreventCache" in _4){
this.urlPreventCache=_4.urlPreventCache?true:false;
}
}
var _5=_1.xhrGet({url:this.url,handleAs:"xml",sync:true,preventCache:this.urlPreventCache});
_5.addCallback(this,"_processOsdd");
_5.addErrback(function(){
throw new Error("Unable to load OpenSearch Description document from ".args.url);
});
},url:"",itemPath:"",_storeRef:"_S",urlElement:null,iframeElement:null,urlPreventCache:true,ATOM_CONTENT_TYPE:3,ATOM_CONTENT_TYPE_STRING:"atom",RSS_CONTENT_TYPE:2,RSS_CONTENT_TYPE_STRING:"rss",XML_CONTENT_TYPE:1,XML_CONTENT_TYPE_STRING:"xml",_assertIsItem:function(_6){
if(!this.isItem(_6)){
throw new Error("dojox.data.OpenSearchStore: a function was passed an item argument that was not an item");
}
},_assertIsAttribute:function(_7){
if(typeof _7!=="string"){
throw new Error("dojox.data.OpenSearchStore: a function was passed an attribute argument that was not an attribute name string");
}
},getFeatures:function(){
return {"dojo.data.api.Read":true};
},getValue:function(_8,_9,_a){
var _b=this.getValues(_8,_9);
if(_b){
return _b[0];
}
return _a;
},getAttributes:function(_c){
return ["content"];
},hasAttribute:function(_d,_e){
if(this.getValue(_d,_e)){
return true;
}
return false;
},isItemLoaded:function(_f){
return this.isItem(_f);
},loadItem:function(_10){
},getLabel:function(_11){
return undefined;
},getLabelAttributes:function(_12){
return null;
},containsValue:function(_13,_14,_15){
var _16=this.getValues(_13,_14);
for(var i=0;i<_16.length;i++){
if(_16[i]===_15){
return true;
}
}
return false;
},getValues:function(_17,_18){
this._assertIsItem(_17);
this._assertIsAttribute(_18);
var _19=this.processItem(_17,_18);
if(_19){
return [_19];
}
return undefined;
},isItem:function(_1a){
if(_1a&&_1a[this._storeRef]===this){
return true;
}
return false;
},close:function(_1b){
},process:function(_1c){
return this["_processOSD"+this.contentType](_1c);
},processItem:function(_1d,_1e){
return this["_processItem"+this.contentType](_1d.node,_1e);
},_createSearchUrl:function(_1f){
var _20=this.urlElement.attributes.getNamedItem("template").nodeValue;
var _21=this.urlElement.attributes;
var _22=_20.indexOf("{searchTerms}");
_20=_20.substring(0,_22)+_1f.query.searchTerms+_20.substring(_22+13);
_1.forEach([{"name":"count","test":_1f.count,"def":"10"},{"name":"startIndex","test":_1f.start,"def":this.urlElement.attributes.getNamedItem("indexOffset")?this.urlElement.attributes.getNamedItem("indexOffset").nodeValue:0},{"name":"startPage","test":_1f.startPage,"def":this.urlElement.attributes.getNamedItem("pageOffset")?this.urlElement.attributes.getNamedItem("pageOffset").nodeValue:0},{"name":"language","test":_1f.language,"def":"*"},{"name":"inputEncoding","test":_1f.inputEncoding,"def":"UTF-8"},{"name":"outputEncoding","test":_1f.outputEncoding,"def":"UTF-8"}],function(_23){
_20=_20.replace("{"+_23.name+"}",_23.test||_23.def);
_20=_20.replace("{"+_23.name+"?}",_23.test||_23.def);
});
return _20;
},_fetchItems:function(_24,_25,_26){
if(!_24.query){
_24.query={};
}
var _27=this;
var url=this._createSearchUrl(_24);
var _28={url:url,preventCache:this.urlPreventCache};
var xhr=_1.xhrGet(_28);
xhr.addErrback(function(_29){
_26(_29,_24);
});
xhr.addCallback(function(_2a){
var _2b=[];
if(_2a){
_2b=_27.process(_2a);
for(var i=0;i<_2b.length;i++){
_2b[i]={node:_2b[i]};
_2b[i][_27._storeRef]=_27;
}
}
_25(_2b,_24);
});
},_processOSDxml:function(_2c){
var div=_1.doc.createElement("div");
div.innerHTML=_2c;
return _1.query(this.itemPath,div);
},_processItemxml:function(_2d,_2e){
if(_2e==="content"){
return _2d.innerHTML;
}
return undefined;
},_processOSDatom:function(_2f){
return this._processOSDfeed(_2f,"entry");
},_processItematom:function(_30,_31){
return this._processItemfeed(_30,_31,"content");
},_processOSDrss:function(_32){
return this._processOSDfeed(_32,"item");
},_processItemrss:function(_33,_34){
return this._processItemfeed(_33,_34,"description");
},_processOSDfeed:function(_35,_36){
_35=_3.xml.parser.parse(_35);
var _37=[];
var _38=_35.getElementsByTagName(_36);
for(var i=0;i<_38.length;i++){
_37.push(_38.item(i));
}
return _37;
},_processItemfeed:function(_39,_3a,_3b){
if(_3a==="content"){
var _3c=_39.getElementsByTagName(_3b).item(0);
return this._getNodeXml(_3c,true);
}
return undefined;
},_getNodeXml:function(_3d,_3e){
var i;
switch(_3d.nodeType){
case 1:
var xml=[];
if(!_3e){
xml.push("<"+_3d.tagName);
var _3f;
for(i=0;i<_3d.attributes.length;i++){
_3f=_3d.attributes.item(i);
xml.push(" "+_3f.nodeName+"=\""+_3f.nodeValue+"\"");
}
xml.push(">");
}
for(i=0;i<_3d.childNodes.length;i++){
xml.push(this._getNodeXml(_3d.childNodes.item(i)));
}
if(!_3e){
xml.push("</"+_3d.tagName+">\n");
}
return xml.join("");
case 3:
case 4:
return _3d.nodeValue;
}
return undefined;
},_processOsdd:function(doc){
var _40=doc.getElementsByTagName("Url");
var _41=[];
var _42;
var i;
for(i=0;i<_40.length;i++){
_42=_40[i].attributes.getNamedItem("type").nodeValue;
switch(_42){
case "application/rss+xml":
_41[i]=this.RSS_CONTENT_TYPE;
break;
case "application/atom+xml":
_41[i]=this.ATOM_CONTENT_TYPE;
break;
default:
_41[i]=this.XML_CONTENT_TYPE;
break;
}
}
var _43=0;
var _44=_41[0];
for(i=1;i<_40.length;i++){
if(_41[i]>_44){
_43=i;
_44=_41[i];
}
}
var _45=_40[_43].nodeName.toLowerCase();
if(_45=="url"){
var _46=_40[_43].attributes;
this.urlElement=_40[_43];
switch(_41[_43]){
case this.ATOM_CONTENT_TYPE:
this.contentType=this.ATOM_CONTENT_TYPE_STRING;
break;
case this.RSS_CONTENT_TYPE:
this.contentType=this.RSS_CONTENT_TYPE_STRING;
break;
case this.XML_CONTENT_TYPE:
this.contentType=this.XML_CONTENT_TYPE_STRING;
break;
}
}
}});
_1.extend(_3.data.OpenSearchStore,_1.data.util.simpleFetch);
return _1.getObject("dojox.data.OpenSearchStore");
});
require(["dojox/data/OpenSearchStore"]);
