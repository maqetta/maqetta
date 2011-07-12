/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojo/main",["./_base/kernel","./has","require","./_base/sniff","./_base/lang","./_base/array","./_base/declare","./_base/Deferred","./_base/json","./_base/Color","require","./_base/browser","./_base/loader"],function(_1,_2,_3){
if(_1.config.isDebug){
_3(["./_firebug/firebug"]);
}
_2.add("dojo-load-firebug-console",!!this["loadFirebugConsole"]);
if(_2("dojo-load-firebug-console")){
loadFirebugConsole();
}
if(_1.config.debugAtAllCosts){
_3.debugAtAllCosts();
}
true||_2.add("dojo-config-require",1);
if(1){
var _4=_1.config.require;
if(_4){
_4=_1.map(_1.isArray(_4)?_4:[_4],function(_5){
return _5.replace(/\./g,"/");
});
if(_1.isAsync){
_3(_4);
}else{
_1.ready(1,function(){
_3(_4);
});
}
}
}
return _1;
});
