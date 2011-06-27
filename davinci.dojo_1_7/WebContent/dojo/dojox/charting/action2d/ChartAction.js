/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/ChartAction",["dojo/_base/kernel","dojo/_base/connect","dojo/_base/declare","./Base"],function(_1,_2,_3,_4){
return _1.declare("dojox.charting.action2d.ChartAction",dojox.charting.action2d.Base,{constructor:function(_5,_6){
},connect:function(){
for(var i=0;i<this._listeners.length;++i){
this._listeners[i].handle=_2(this.chart.node,this._listeners[i].eventName,this,this._listeners[i].methodName);
}
},disconnect:function(){
for(var i=0;i<this._listeners.length;++i){
_1.disconnect(this._listeners[i].handle);
delete this._listeners[i].handle;
}
}});
});
