/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/validate/_base",["dojo/_base/lang","dojo/regexp","dojo/number","./regexp"],function(_1,_2,_3,_4){
_1.getObject("validate",true,dojox);
dojox.validate.isText=function(_5,_6){
_6=(typeof _6=="object")?_6:{};
if(/^\s*$/.test(_5)){
return false;
}
if(typeof _6.length=="number"&&_6.length!=_5.length){
return false;
}
if(typeof _6.minlength=="number"&&_6.minlength>_5.length){
return false;
}
if(typeof _6.maxlength=="number"&&_6.maxlength<_5.length){
return false;
}
return true;
};
dojox.validate._isInRangeCache={};
dojox.validate.isInRange=function(_7,_8){
_7=_3.parse(_7,_8);
if(isNaN(_7)){
return false;
}
_8=(typeof _8=="object")?_8:{};
var _9=(typeof _8.max=="number")?_8.max:Infinity,_a=(typeof _8.min=="number")?_8.min:-Infinity,_b=(typeof _8.decimal=="string")?_8.decimal:".",_c=dojox.validate._isInRangeCache,_d=_7+"max"+_9+"min"+_a+"dec"+_b;
if(typeof _c[_d]!="undefined"){
return _c[_d];
}
_c[_d]=!(_7<_a||_7>_9);
return _c[_d];
};
dojox.validate.isNumberFormat=function(_e,_f){
var re=new RegExp("^"+_4.numberFormat(_f)+"$","i");
return re.test(_e);
};
dojox.validate.isValidLuhn=function(_10){
var sum=0,_11,_12;
if(!_1.isString(_10)){
_10=String(_10);
}
_10=_10.replace(/[- ]/g,"");
_11=_10.length%2;
for(var i=0;i<_10.length;i++){
_12=parseInt(_10.charAt(i));
if(i%2==_11){
_12*=2;
}
if(_12>9){
_12-=9;
}
sum+=_12;
}
return !(sum%10);
};
return dojox.validate;
});
