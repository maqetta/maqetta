/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/JsonRest",["../_base/kernel","../_base/xhr","../json","../_base/declare","./util/QueryResults"],function(_1,_2,_3,_4,_5){
return _4("dojo.store.JsonRest",null,{constructor:function(_6){
_1.safeMixin(this,_6);
},target:"",idProperty:"id",get:function(id,_7){
var _8=_7||{};
_8.Accept="application/javascript, application/json";
return _2("GET",{url:this.target+id,handleAs:"json",headers:_8});
},getIdentity:function(_9){
return _9[this.idProperty];
},put:function(_a,_b){
_b=_b||{};
var id=("id" in _b)?_b.id:this.getIdentity(_a);
var _c=typeof id!="undefined";
return _2(_c&&!_b.incremental?"PUT":"POST",{url:_c?this.target+id:this.target,postData:_3.stringify(_a),handleAs:"json",headers:{"Content-Type":"application/json","If-Match":_b.overwrite===true?"*":null,"If-None-Match":_b.overwrite===false?"*":null}});
},add:function(_d,_e){
_e=_e||{};
_e.overwrite=false;
return this.put(_d,_e);
},remove:function(id){
return _2("DELETE",{url:this.target+id});
},query:function(_f,_10){
var _11={Accept:"application/javascript, application/json"};
_10=_10||{};
if(_10.start>=0||_10.count>=0){
_11.Range="items="+(_10.start||"0")+"-"+(("count" in _10&&_10.count!=Infinity)?(_10.count+(_10.start||0)-1):"");
}
if(_f&&typeof _f=="object"){
_f=_1.objectToQuery(_f);
_f=_f?"?"+_f:"";
}
if(_10&&_10.sort){
_f+=(_f?"&":"?")+"sort(";
for(var i=0;i<_10.sort.length;i++){
var _12=_10.sort[i];
_f+=(i>0?",":"")+(_12.descending?"-":"+")+encodeURIComponent(_12.attribute);
}
_f+=")";
}
var _13=_2("GET",{url:this.target+(_f||""),handleAs:"json",headers:_11});
_13.total=_13.then(function(){
var _14=_13.ioArgs.xhr.getResponseHeader("Content-Range");
return _14&&(_14=_14.match(/\/(.*)/))&&+_14[1];
});
return _5(_13);
}});
});
