/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./_base"],function(_1){
dojo.experimental("dojox.timing.doLater");
_1.doLater=function(_2,_3,_4){
if(_2){
return false;
}
var _5=_1.doLater.caller,_6=_1.doLater.caller.arguments;
_4=_4||100;
_3=_3||dojo.global;
setTimeout(function(){
_5.apply(_3,_6);
},_4);
return true;
};
return _1.doLater;
});
