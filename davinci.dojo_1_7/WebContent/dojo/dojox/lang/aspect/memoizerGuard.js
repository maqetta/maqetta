/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/lang/aspect/memoizerGuard",["dojo","dijit","dojox"],function(_1,_2,_3){
_1.getObject("dojox.lang.aspect.memoizerGuard",1);
(function(){
var _4=_3.lang.aspect,_5=function(_6){
var _7=_4.getContext().instance,t;
if(!(t=_7.__memoizerCache)){
return;
}
if(arguments.length==0){
delete _7.__memoizerCache;
}else{
if(_1.isArray(_6)){
_1.forEach(_6,function(m){
delete t[m];
});
}else{
delete t[_6];
}
}
};
_4.memoizerGuard=function(_8){
return {after:function(){
_5(_8);
}};
};
})();
return _1.getObject("dojox.lang.aspect.memoizerGuard");
});
require(["dojox/lang/aspect/memoizerGuard"]);
