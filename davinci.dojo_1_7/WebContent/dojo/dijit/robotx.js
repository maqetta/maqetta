/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dijit/robotx",["dojo/_base/kernel",".","./robot","dojo/robotx","dojo/_base/window"],function(_1,_2){
_1.experimental("dijit.robotx");
var _3=doh.robot._updateDocument;
_1.mixin(doh.robot,{_updateDocument:function(){
_3();
var _4=_1.global;
if(_4["dijit"]){
window.dijit=_4.dijit;
}
}});
return _2;
});
