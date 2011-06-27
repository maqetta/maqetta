/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/DeferredList",["./_base/kernel","./_base/Deferred","./_base/array"],function(_1){
_1.DeferredList=function(_2,_3,_4,_5,_6){
var _7=[];
_1.Deferred.call(this);
var _8=this;
if(_2.length===0&&!_3){
this.resolve([0,[]]);
}
var _9=0;
_1.forEach(_2,function(_a,i){
_a.then(function(_b){
if(_3){
_8.resolve([i,_b]);
}else{
_c(true,_b);
}
},function(_d){
if(_4){
_8.reject(_d);
}else{
_c(false,_d);
}
if(_5){
return null;
}
throw _d;
});
function _c(_e,_f){
_7[i]=[_e,_f];
_9++;
if(_9===_2.length){
_8.resolve(_7);
}
};
});
};
_1.DeferredList.prototype=new _1.Deferred();
_1.DeferredList.prototype.gatherResults=function(_10){
var d=new _1.DeferredList(_10,false,true,false);
d.addCallback(function(_11){
var ret=[];
_1.forEach(_11,function(_12){
ret.push(_12[1]);
});
return ret;
});
return d;
};
return _1.DeferredList;
});
