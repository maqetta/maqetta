/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/validate/isbn",["dojo/_base/lang","./_base"],function(_1,_2){
dojox.validate.isValidIsbn=function(_3){
var _4,_5=0,_6;
if(!_1.isString(_3)){
_3=String(_3);
}
_3=_3.replace(/[- ]/g,"");
_4=_3.length;
switch(_4){
case 10:
_6=_4;
for(var i=0;i<9;i++){
_5+=parseInt(_3.charAt(i))*_6;
_6--;
}
var t=_3.charAt(9).toUpperCase();
_5+=t=="X"?10:parseInt(t);
return _5%11==0;
break;
case 13:
_6=-1;
for(var i=0;i<_4;i++){
_5+=parseInt(_3.charAt(i))*(2+_6);
_6*=-1;
}
return _5%10==0;
break;
}
return false;
};
return dojox.validate.isValidIsbn;
});
