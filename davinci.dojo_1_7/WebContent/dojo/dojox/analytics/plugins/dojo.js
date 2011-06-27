/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/plugins/dojo",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,_3){
_1.getObject("analytics.plugins",true,dojox);
dojox.analytics.plugins.dojo=new (function(){
this.addData=_1.hitch(_3,"addData","dojo");
_1.addOnLoad(_1.hitch(this,function(){
var _4={};
for(var i in _1){
if((i=="version")||((!_1.isObject(_1[i]))&&(i[0]!="_"))){
_4[i]=_1[i];
}
}
if(_1.config){
_4.djConfig=_1.config;
}
this.addData(_4);
}));
})();
return dojox.analytics.plugins.dojo;
});
