/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/_base/unload",["./kernel","./connect"],function(_1){
var _2=window;
_1.addOnWindowUnload=function(_3,_4){
if(!_1.windowUnloaded){
_1.connect(_2,"unload",(_1.windowUnloaded=function(){
}));
}
_1.connect(_2,"unload",_3,_4);
};
_1.addOnUnload=function(_5,_6){
_1.connect(_2,"beforeunload",_5,_6);
};
return {addOnWindowUnload:_1.addOnWindowUnload,addOnUnload:_1.addOnUnload};
});
