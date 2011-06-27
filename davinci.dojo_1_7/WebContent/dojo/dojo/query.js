/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/query",["./_base/kernel","./_base/NodeList","./has","./selector/_loader","./selector/_loader!default"],function(_1,_2,_3,_4,_5){
"use strict";
function _6(_7){
var _8=function(_9,_a){
if(typeof _a=="string"){
_a=_1.byId(_a);
if(!_a){
return _2._wrap([]);
}
}
var _b=typeof _9=="string"?_7(_9,_a):_9.orphan?_9:[_9];
if(!(_b instanceof Array)){
var _c=[];
for(var i=0,l=_b.length;i<l;i++){
_c.push(_b[i]);
}
_b=_c;
}else{
if(_b.orphan){
return _b;
}
}
return _2._wrap(_b);
};
_8.matches=_7.match||function(_d,_e,_f){
return _8.filter([_d],_e,_f).length>0;
};
_8.filter=_7.filter||function(_10,_11,_12){
return _8(_11,_12).filter(function(_13){
return _1.indexOf(_10,_13)>-1;
});
};
if(typeof _7!="function"){
var _14=_7.search;
_7=function(_15,_16){
return _14(_16||document,_15);
};
}
return _8;
};
var _17=_1.query=_6(_5);
_17.load=function(id,_18,_19,_1a){
_4.load(id,_18,function(_1b){
_19(_6(_1b));
});
};
_1._filterQueryResult=function(_1c,_1d,_1e){
return _2._wrap(_17.filter(_1c,_1d,_1e));
};
return _17;
});
