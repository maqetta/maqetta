/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/uuid/generateRandomUuid",["dojo/_base/kernel","./_base"],function(_1){
dojox.uuid.generateRandomUuid=function(){
var _2=16;
function _3(){
var _4=Math.floor((Math.random()%1)*Math.pow(2,32));
var _5=_4.toString(_2);
while(_5.length<8){
_5="0"+_5;
}
return _5;
};
var _6="-";
var _7="4";
var _8="8";
var a=_3();
var b=_3();
b=b.substring(0,4)+_6+_7+b.substring(5,8);
var c=_3();
c=_8+c.substring(1,4)+_6+c.substring(4,8);
var d=_3();
var _9=a+_6+b+_6+c+d;
_9=_9.toLowerCase();
return _9;
};
return dojox.uuid.generateRandomUuid;
});
