/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/analytics/plugins/idle",["dojo/_base/kernel","dojo/_base/lang","../_base"],function(_1,_2,_3){
_3.plugins.idle=new (function(){
this.addData=_1.hitch(_3,"addData","idle");
this.idleTime=_1.config["idleTime"]||60000;
this.idle=true;
this.setIdle=function(){
this.addData("isIdle");
this.idle=true;
};
_1.addOnLoad(_1.hitch(this,function(){
var _4=["onmousemove","onkeydown","onclick","onscroll"];
for(var i=0;i<_4.length;i++){
_1.connect(_1.doc,_4[i],this,function(e){
if(this.idle){
this.idle=false;
this.addData("isActive");
this.idleTimer=setTimeout(_1.hitch(this,"setIdle"),this.idleTime);
}else{
clearTimeout(this.idleTimer);
this.idleTimer=setTimeout(_1.hitch(this,"setIdle"),this.idleTime);
}
});
}
}));
})();
return dojox.analytics.plugins.idle;
});
