/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/data/S3Store",["dojo","dojox","dojox/data/JsonRestStore","dojox/rpc/ProxiedPath"],function(_1,_2){
_1.declare("dojox.data.S3Store",_2.data.JsonRestStore,{_processResults:function(_3){
var _4=_3.getElementsByTagName("Key");
var _5=[];
var _6=this;
for(var i=0;i<_4.length;i++){
var _7=_4[i];
var _8={_loadObject:(function(_9,_a){
return function(_b){
delete this._loadObject;
_6.service(_9).addCallback(_b);
};
})(_7.firstChild.nodeValue,_8)};
_5.push(_8);
}
return {totalCount:_5.length,items:_5};
}});
return _2.data.S3Store;
});
