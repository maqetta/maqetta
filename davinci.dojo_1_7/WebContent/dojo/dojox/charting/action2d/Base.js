/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//>>built
define("dojox/charting/action2d/Base",["dojo/_base/kernel","../../main","dojo/_base/lang","dojo/_base/declare"],function(_1,_2){
return _1.declare("dojox.charting.action2d.Base",null,{constructor:function(_3,_4){
this.chart=_3;
this.plot=_4?(_1.isString(_4)?this.chart.getPlot(_4):_4):this.chart.getPlot("default");
},connect:function(){
},disconnect:function(){
},destroy:function(){
this.disconnect();
}});
});
