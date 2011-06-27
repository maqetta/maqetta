/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/touch",["./_base/kernel","./on","./has"],function(_1,on,_2){
function _3(_4){
return function(_5,_6){
return on(_5,_4,_6);
};
};
var _7=_2("touch");
_1.touch={press:_3(_7?"touchstart":"mousedown"),move:_3(_7?"touchmove":"mousemove"),release:_3(_7?"touchend":"mouseup")};
return _1.touch;
});
