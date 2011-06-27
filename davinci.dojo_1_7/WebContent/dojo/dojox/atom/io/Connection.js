/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/atom/io/Connection",["dojo","dijit","dojox","dojox/atom/io/model"],function(_1,_2,_3){
_1.getObject("dojox.atom.io.Connection",1);
_1.declare("dojox.atom.io.Connection",null,{constructor:function(_4,_5){
this.sync=_4;
this.preventCache=_5;
},preventCache:false,alertsEnabled:false,getFeed:function(_6,_7,_8,_9){
this._getXmlDoc(_6,"feed",new _3.atom.io.model.Feed(),_3.atom.io.model._Constants.ATOM_NS,_7,_8,_9);
},getService:function(_a,_b,_c,_d){
this._getXmlDoc(_a,"service",new _3.atom.io.model.Service(_a),_3.atom.io.model._Constants.APP_NS,_b,_c,_d);
},getEntry:function(_e,_f,_10,_11){
this._getXmlDoc(_e,"entry",new _3.atom.io.model.Entry(),_3.atom.io.model._Constants.ATOM_NS,_f,_10,_11);
},_getXmlDoc:function(url,_12,_13,_14,_15,_16,_17){
if(!_17){
_17=_1.global;
}
var ae=this.alertsEnabled;
var _18={url:url,handleAs:"xml",sync:this.sync,preventCache:this.preventCache,load:function(_19,_1a){
var _1b=null;
var _1c=_19;
var _1d;
if(_1c){
if(typeof (_1c.getElementsByTagNameNS)!="undefined"){
_1d=_1c.getElementsByTagNameNS(_14,_12);
if(_1d&&_1d.length>0){
_1b=_1d.item(0);
}else{
if(_1c.lastChild){
_1b=_1c.lastChild;
}
}
}else{
if(typeof (_1c.getElementsByTagName)!="undefined"){
_1d=_1c.getElementsByTagName(_12);
if(_1d&&_1d.length>0){
for(var i=0;i<_1d.length;i++){
if(_1d[i].namespaceURI==_14){
_1b=_1d[i];
break;
}
}
}else{
if(_1c.lastChild){
_1b=_1c.lastChild;
}
}
}else{
if(_1c.lastChild){
_1b=_1c.lastChild;
}else{
_15.call(_17,null,null,_1a);
return;
}
}
}
_13.buildFromDom(_1b);
if(_15){
_15.call(_17,_13,_1c,_1a);
}else{
if(ae){
throw new Error("The callback value does not exist.");
}
}
}else{
_15.call(_17,null,null,_1a);
}
}};
if(this.user&&this.user!==null){
_18.user=this.user;
}
if(this.password&&this.password!==null){
_18.password=this.password;
}
if(_16){
_18.error=function(_1e,_1f){
_16.call(_17,_1e,_1f);
};
}else{
_18.error=function(){
throw new Error("The URL requested cannot be accessed");
};
}
_1.xhrGet(_18);
},updateEntry:function(_20,_21,_22,_23,_24,_25){
if(!_25){
_25=_1.global;
}
_20.updated=new Date();
var url=_20.getEditHref();
if(!url){
throw new Error("A URL has not been specified for editing this entry.");
}
var _26=this;
var ae=this.alertsEnabled;
var _27={url:url,handleAs:"text",contentType:"text/xml",sync:this.sync,preventCache:this.preventCache,load:function(_28,_29){
var _2a=null;
if(_23){
_2a=_29.xhr.getResponseHeader("Location");
if(!_2a){
_2a=url;
}
var _2b=function(_2c,dom,_2d){
if(_21){
_21.call(_25,_2c,_2a,_2d);
}else{
if(ae){
throw new Error("The callback value does not exist.");
}
}
};
_26.getEntry(_2a,_2b);
}else{
if(_21){
_21.call(_25,_20,_29.xhr.getResponseHeader("Location"),_29);
}else{
if(ae){
throw new Error("The callback value does not exist.");
}
}
}
return _28;
}};
if(this.user&&this.user!==null){
_27.user=this.user;
}
if(this.password&&this.password!==null){
_27.password=this.password;
}
if(_22){
_27.error=function(_2e,_2f){
_22.call(_25,_2e,_2f);
};
}else{
_27.error=function(){
throw new Error("The URL requested cannot be accessed");
};
}
if(_24){
_27.postData=_20.toString(true);
_27.headers={"X-Method-Override":"PUT"};
_1.rawXhrPost(_27);
}else{
_27.putData=_20.toString(true);
var xhr=_1.rawXhrPut(_27);
}
},addEntry:function(_30,url,_31,_32,_33,_34){
if(!_34){
_34=_1.global;
}
_30.published=new Date();
_30.updated=new Date();
var _35=_30.feedUrl;
var ae=this.alertsEnabled;
if(!url&&_35){
url=_35;
}
if(!url){
if(ae){
throw new Error("The request cannot be processed because the URL parameter is missing.");
}
return;
}
var _36=this;
var _37={url:url,handleAs:"text",contentType:"text/xml",sync:this.sync,preventCache:this.preventCache,postData:_30.toString(true),load:function(_38,_39){
var _3a=_39.xhr.getResponseHeader("Location");
if(!_3a){
_3a=url;
}
if(!_39.retrieveEntry){
if(_31){
_31.call(_34,_30,_3a,_39);
}else{
if(ae){
throw new Error("The callback value does not exist.");
}
}
}else{
var _3b=function(_3c,dom,_3d){
if(_31){
_31.call(_34,_3c,_3a,_3d);
}else{
if(ae){
throw new Error("The callback value does not exist.");
}
}
};
_36.getEntry(_3a,_3b);
}
return _38;
}};
if(this.user&&this.user!==null){
_37.user=this.user;
}
if(this.password&&this.password!==null){
_37.password=this.password;
}
if(_32){
_37.error=function(_3e,_3f){
_32.call(_34,_3e,_3f);
};
}else{
_37.error=function(){
throw new Error("The URL requested cannot be accessed");
};
}
_1.rawXhrPost(_37);
},deleteEntry:function(_40,_41,_42,_43,_44){
if(!_44){
_44=_1.global;
}
var url=null;
if(typeof (_40)=="string"){
url=_40;
}else{
url=_40.getEditHref();
}
if(!url){
_41.call(_44,false,null);
throw new Error("The request cannot be processed because the URL parameter is missing.");
}
var _45={url:url,handleAs:"text",sync:this.sync,preventCache:this.preventCache,load:function(_46,_47){
_41.call(_44,_47);
return _46;
}};
if(this.user&&this.user!==null){
_45.user=this.user;
}
if(this.password&&this.password!==null){
_45.password=this.password;
}
if(_42){
_45.error=function(_48,_49){
_42.call(_44,_48,_49);
};
}else{
_45.error=function(){
throw new Error("The URL requested cannot be accessed");
};
}
if(_43){
_45.headers={"X-Method-Override":"DELETE"};
_1.xhrPost(_45);
}else{
_1.xhrDelete(_45);
}
}});
return _1.getObject("dojox.atom.io.Connection");
});
require(["dojox/atom/io/Connection"]);
