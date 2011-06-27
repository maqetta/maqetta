/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/mobile/transition",["dojo/_base/kernel","dojo/_base/array","dojo/_base/html","dojo/DeferredList"],function(_1,_2,_3,_4){
return function(_5,to,_6){
var _7=(_6&&_6.reverse)?" mblReverse":"";
if(!_6||!_6.transition){
if(_5&&_5.tagname){
_1.style(_5,"display","none");
}
if(to){
_1.style(to,"display","");
}
}else{
var _8=[];
if(to){
_1.style(to,"display","");
}
if(_5){
_1.style(_5,"display","");
var _9=new _1.Deferred();
var _a=_1.connect(_5,"webkitAnimationEnd",function(){
_1.style(_5,"display","none");
_1.forEach([_6.transition,"mblIn","mblOut","mblReverse"],function(_b){
_1.removeClass(_5,_b);
});
_1.disconnect(_a);
_9.resolve(_5);
});
_8.push(_9);
}
var _c=new _1.Deferred();
var _d=_1.connect(to,"webkitAnimationEnd",function(){
_1.forEach([_6.transition,"mblIn","mblOut","mblReverse"],function(_e){
_1.removeClass(to,_e);
});
_1.disconnect(_d);
_c.resolve(to);
});
_8.push(_c);
_6.transition="mbl"+(_6.transition.charAt(0).toUpperCase()+_6.transition.substring(1));
_1.addClass(_5,_6.transition+" mblOut"+_7);
_1.addClass(to,_6.transition+" mblIn"+_7);
return new _1.DeferredList(_8);
}
};
});
