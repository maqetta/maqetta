/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/store/util/QueryResults",["../../_base/kernel","../../_base/lang","../../_base/Deferred"],function(_1){
_1.getObject("store.util",true,_1);
_1.store.util.QueryResults=function(_2){
if(!_2){
return _2;
}
if(_2.then){
_2=_1.delegate(_2);
}
function _3(_4){
if(!_2[_4]){
_2[_4]=function(){
var _5=arguments;
return _1.when(_2,function(_6){
Array.prototype.unshift.call(_5,_6);
return _1.store.util.QueryResults(_1[_4].apply(_1,_5));
});
};
}
};
_3("forEach");
_3("filter");
_3("map");
if(!_2.total){
_2.total=_1.when(_2,function(_7){
return _7.length;
});
}
return _2;
};
return _1.store.util.QueryResults;
});
